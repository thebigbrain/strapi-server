/**
 *
 * EditForm
 *
 */

import React from "react";
import PropTypes from "prop-types";
import { get } from "lodash";

import { InputsIndex as Input, LoadingIndicator } from "strapi-helper-plugin";

import { Wrapper } from "./Components";

function EditForm({ onChange, showLoaders, values }) {
  const { roles, settings } = values;

  const generateSelectOptions = () =>
    Object.keys(get(values, "roles", [])).reduce((acc, current) => {
      const option = {
        id: get(roles, [current, "name"]),
        value: get(roles, [current, "type"])
      };
      acc.push(option);
      return acc;
    }, []);

  return (
    <Wrapper className={showLoaders && "load-container"}>
      {showLoaders ? (
        <LoadingIndicator />
      ) : (
        <div>
          <div className="row">
            <Input
              inputDescription={{
                id: "users-permissions.EditForm.inputSelect.description.role"
              }}
              label={{
                id: "users-permissions.EditForm.inputSelect.label.role"
              }}
              name="advanced.settings.default_role"
              onChange={onChange}
              selectOptions={generateSelectOptions()}
              type="select"
              value={get(settings, "default_role")}
            />
            <div className="col-6"></div>
            <Input
              label={{
                id: "users-permissions.EditForm.inputToggle.label.phone_bind"
              }}
              inputDescription={{
                id:
                  "users-permissions.EditForm.inputToggle.description.phone_bind"
              }}
              name="advanced.settings.phone_bind"
              onChange={onChange}
              type="toggle"
              value={get(settings, "phone_bind")}
            />
            <div className="col-6"></div>
            <Input
              label={{
                id:
                  "users-permissions.EditForm.inputToggle.label.phone_bind_redirection"
              }}
              inputDescription={{
                id:
                  "users-permissions.EditForm.inputToggle.description.phone_bind_redirection"
              }}
              name="advanced.settings.phone_bind_redirection"
              onChange={onChange}
              type="text"
              value={get(settings, "phone_bind_redirection")}
            />
          </div>
        </div>
      )}
    </Wrapper>
  );
}

EditForm.propTypes = {
  onChange: PropTypes.func.isRequired,
  showLoaders: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired
};

export default EditForm;
