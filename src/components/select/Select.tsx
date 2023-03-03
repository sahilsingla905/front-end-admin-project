import React, { FC } from 'react';
import MenuItem from '@mui/material/MenuItem';
import { Select, SelectChangeEvent } from '@mui/material';
import './Select.css';

export type SelectOptionsType = {
    label: string,
    value: string
}
type SelectType = {
    selectClass?: string,
    onSelectClickHandler?: (x: string) => void,
    options: Array<SelectOptionsType>,
    defaultValue?: string,
    label?: string,
};
export const SelectComp: FC<SelectType> = ({ onSelectClickHandler = () => {}, selectClass = "", options, defaultValue = options[0].value, label = "" }) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedValue(event.target.value);
    onSelectClickHandler(event.target.value);
  };

  return (
      <Select
        value={selectedValue}
        label={label}
        onChange={handleChange}
        className={`h-[32px] min-w-[135px] !bg-[#1BC5BD] !text-white custom-select !ring-0 !ring-[#1BC5BD] ${selectClass}`}
      >
        {
            options.map((option) => {
                return (<MenuItem key={option?.label + option?.value} className={`!bg-[#1BC5BD] !text-white`} value={option.value}>
                    {option.label}
                </MenuItem>)
            })
        }
      </Select>
  );
}