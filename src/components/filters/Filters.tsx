import React, { FC, useState } from 'react';
import { Button } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { SelectComp, SelectOptionsType } from '../select/Select';
import { DatePicker  as MuiDatePicker, LocalizationProvider } from '@mui/x-date-pickers';

export type FormInputType = {
  selectedGateway: string,
  selectedProject: string,
  selectedStartDate: any,
  selectedEndDate: any,
}

type FilterPropsType = {
  onFormSubmitHandler?: (x: FormInputType) => void,
  projects: Array<any>,
  gateways: Array<any>,
}
export const Filter: FC<FilterPropsType> = ({projects, gateways, onFormSubmitHandler = () => {}}) => {
  const [startDateValue, setStartDateValue] = useState<any>(dayjs(new Date('2021-01-01')));
  const [endDateValue, setEndDateValue] = useState<any>(dayjs(new Date('2021-12-31')));

  const formatProjectOptions = (data: any[]) => {
    const formattedData: Array<SelectOptionsType> = [{label: "All Projects", value: "all"}]
      data.forEach((project) => {
        formattedData.push({
          label: project.name,
          value: project.projectId,
        })
      })

    return formattedData;
  }

  const formatGatewayOptions = (data: any[]) => {
    const formattedData: Array<SelectOptionsType> = [{label: "All Gateways", value: "all"}]
      data.forEach((project) => {
        formattedData.push({
          label: project.name,
          value: project.gatewayId,
        })
      })
    return formattedData;
  }

  const handleSubmitClick = (event: any) => {
    event.preventDefault();
    onFormSubmitHandler({
      selectedGateway: event?.target?.gatewaySelect.value,
      selectedProject: event?.target?.projectSelect.value,
      selectedStartDate: startDateValue,
      selectedEndDate: endDateValue,
    });
  }

  return (
    <form onSubmit={handleSubmitClick}>
      <div className='flex gap-x-5'>
        <SelectComp options={formatProjectOptions(projects)} name="projectSelect" label="Projects" />
        <SelectComp options={formatGatewayOptions(gateways)} name="gatewaySelect" label="Gateways" />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MuiDatePicker
            value={startDateValue}
            onChange={(newValue: any) => {
              setStartDateValue(newValue);
            }}
            maxDate={dayjs(new Date('2021-12-30'))}
            minDate={dayjs(new Date('2021-01-01'))}
            className={`h-[32px] !bg-[#1BC5BD] !text-white custom-select !ring-0 !ring-[#1BC5BD] custom-date-picker rounded-[5px] w-[160px]`}
          />
          <MuiDatePicker
            value={endDateValue}
            onChange={(newValue: any) => {
              setEndDateValue(newValue);
            }}
            maxDate={dayjs(new Date('2021-12-31'))}
            minDate={dayjs(new Date('2021-01-02'))}
            className={`h-[32px] !bg-[#1BC5BD] !text-white custom-select !ring-0 !ring-[#1BC5BD] custom-date-picker rounded-[5px] w-[160px]`}
          />
        </LocalizationProvider>
        <Button variant="contained" type="submit" className='h-[32px] px-2.5 py-2 !normal-case !bg-[#005B96]'>Generate report</Button>
      </div>
    </form>
  );
}