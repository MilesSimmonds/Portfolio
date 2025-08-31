import React from "react";

const SelectBox = ({ options, value, onChange, isMulti = false }) => {
  return (
    <div>
      <select
        id="selectBox"
        multiple={isMulti}
        value={value}
        onChange={(event) => {
          if (isMulti) {
            const selected = Array.from(event.target.selectedOptions, (opt) => opt.value);
            onChange(selected);
          } else {
            onChange(event);
          }
        }}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectBox;
