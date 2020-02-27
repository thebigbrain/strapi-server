"use strict";

/**
 * Module dependencies.
 */

// Public node modules.
const _ = require("lodash");
const request = require("request");

// Purest strategies.
const purest = require("purest")({ request });
const purestConfig = require("@purest/providers");

/**
 * Connect thanks to a third-party provider.
 *
 *
 * @param {String}    provider
 * @param {String}    access_token
 *
 * @return  {*}
 */

exports.connect = (provider, query) => {
  const access_token = query.access_token || query.code || query.oauth_token;

  return new Promise((resolve, reject) => {
    if (!access_token) {
      return reject([null, { message: "No access_token." }]);
    }

    // Get the profile.
    getProfile(provider, query, async (err, profile, providerParams = null) => {
      if (err) {
        return reject([null, err]);
      }

      if (!providerParams) reject([null, `Unknown provider: ${provider}.`]);

      try {
        let createdProvider = await strapi
          .query("provider", "oauth-provider")
          .findOne({
            provider,
            provider_id: providerParams.provider_id
          });

        if (!createdProvider) {
          createdProvider = await strapi
            .query("provider", "oauth-provider")
            .create(providerParams);
        }

        const advanced = await strapi
          .store({
            environment: "",
            type: "plugin",
            name: "users-permissions",
            key: "advanced"
          })
          .get();

        if (advanced.phone_bind) {
          return reject([
            createdProvider.id,
            null,
            advanced.phone_bind_redirection,
            "phone-bind"
          ]);
        }

        const providerField = `provider_${provider}`;
        const user = await strapi.query("user", "users-permissions").findOne({
          [providerField]: createdProvider.id
        });

        if (user) {
          return resolve([user, null]);
        }

        // Retrieve default role.
        const defaultRole = await strapi
          .query("role", "users-permissions")
          .findOne({ type: advanced.default_role }, []);

        if (!profile.email)
          profile.email = `${profile.username}@zhiweicloud.io`;

        // Create the new user.
        const params = _.assign(profile, {
          [providerField]: createdProvider.id,
          role: defaultRole.id,
          confirmed: true
        });

        const createdUser = await strapi
          .query("user", "users-permissions")
          .create(params);

        return resolve([createdUser, null]);
      } catch (err) {
        reject([null, err]);
      }
    });
  });
};

/**
 * Helper to get profiles
 *
 * @param {String}   provider
 * @param {Function} callback
 */

const getProfile = async (provider, query, callback) => {
  const access_token = query.access_token || query.code || query.oauth_token;

  const grant = await strapi
    .store({
      environment: "",
      type: "plugin",
      name: "users-permissions",
      key: "grant"
    })
    .get();

  switch (provider) {
    case "github": {
      const github = purest({
        provider: "github",
        config: purestConfig,
        defaults: {
          headers: {
            "user-agent": "strapi"
          }
        }
      });

      request.post(
        {
          url: "https://github.com/login/oauth/access_token",
          form: {
            client_id: grant.github.key,
            client_secret: grant.github.secret,
            code: access_token
          }
        },
        (err, res, body) => {
          github
            .query()
            .get("user")
            .auth(body.split("&")[0].split("=")[1])
            .request((err, res, userbody) => {
              if (err) {
                return callback(err);
              }

              // This is the public email on the github profile
              if (userbody.email) {
                return callback(null, {
                  username: userbody.login,
                  email: userbody.email
                });
              }

              // Get the email with Github's user/emails API
              github
                .query()
                .get("user/emails")
                .auth(body.split("&")[0].split("=")[1])
                .request((err, res, emailsbody) => {
                  if (err) {
                    return callback(err);
                  }

                  return callback(null, {
                    username: userbody.login,
                    email: Array.isArray(emailsbody)
                      ? emailsbody.find(email => email.primary === true).email
                      : null
                  });
                });
            });
        }
      );
      break;
    }
    case "wechat": {
      const wechat = purest({
        provider: "wechat",
        config: {
          wechat: {
            "https://api.weixin.qq.com": {
              "sns/{endpoint}": {
                __path: {
                  alias: "sns"
                }
              }
            }
          }
        }
      });

      const openid = query.raw.openid;

      wechat
        .query("sns")
        .get("userinfo")
        .qs({ access_token, openid, lang: "zh_CN" })
        .request((err, res, body) => {
          if (err) {
            callback(err);
          } else {
            callback(
              null,
              {
                username: `${provider}_${openid}`
              },
              {
                provider_id: openid,
                provider,
                data: body
              }
            );
          }
        });
      break;
    }
    default:
      callback({
        message: `Unknown provider: ${provider}.`
      });
      break;
  }
};
