import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import CreditCardTwoToneIcon from '@mui/icons-material/CreditCardTwoTone';
import GridViewTwoToneIcon from '@mui/icons-material/GridViewTwoTone';
import ComputerTwoToneIcon from '@mui/icons-material/ComputerTwoTone';
import PieChartIcon from '@mui/icons-material/PieChart';
import PowerSettingsNewTwoToneIcon from '@mui/icons-material/PowerSettingsNewTwoTone';
import { Button, TextField, TextFieldProps } from '@mui/material';
import ListItem from './components/list/ListItem';
import { SelectComp, SelectOptionsType } from './components/select/Select';
import { DatePicker  as MuiDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import moment from 'moment';
import AppTable from './components/table/Table';
import List from './components/list/List';
import { formatCurrency } from './utils/CurrentFormat';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);


type ReportReponseType = {
  amount: number,
  created: string,
  gatewayId: string,
  modified: string,
  projectId: string,
  paymentId: string,
  userIds: Array<string>,
}

type PorjectReportType = {
  gatewayName?: string,
  amount?: number,
  total?: number,
  date?: string,
  gatewayId?: string,
  paymentId?: string,
}

type ReportType = Record<string, PorjectReportType>

const doughnutData = {
  labels: ['#A259FF', '#F24E1E', '#FFC107', '#6497B1'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: ['#A259FF', '#F24E1E', '#FFC107', '#6497B1'],
      borderColor: ['#A259FF', '#F24E1E', '#FFC107', '#6497B1'],
      borderWidth: 1,
    },
  ],
};

function Main() {
  const [projects, setProjects] = useState<Array<any>>([])
  const [gateways, setGateways] = useState<Array<any>>([])
  const [gateway, setGateway] = useState<string>("all");
  const [project, setProject] = useState<string>("all");
  const [startDateValue, setStartDateValue] = useState<any>(new Date('2021-01-01'));
  const [endDateValue, setEndDateValue] = useState<any>(new Date('2021-12-31'));
  const [reportResult, setReportResult]=  useState<ReportType>({});


  useEffect(() => {
    (async function () {
      const [gatewayResponse, projectsResponse] = await Promise.all([fetch("http://178.63.13.157:8090/mock-api/api/gateways"), fetch("http://178.63.13.157:8090/mock-api/api/projects")]);
      const { data: gatewayData, error: gatewayError } = await gatewayResponse.json();
      const { data, error } = await projectsResponse.json();
      setProjects(data);
      setGateways(gatewayData);
      generateReport();
    })();
  }, []);

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

  const onProjectChange = (value: string) => {
    setProject(value)
  }

  const onGatewayChange = (value: string) => {
    setGateway(value)
  }

  const getLabel = (value: string, type: 'gateway' | 'project' ) => {
    switch (type) {
      case "gateway":
        if (value === "all") {
          return "All Gateways";
        }
        return  gateways.find((gateway) => gateway.gatewayId === value)?.name;
      case "project":
        if (value === "all") {
          return "All Projects";
        }
        return projects.find((project) => project.projectId === value)?.name;
      default:
        return "";
    }
  }
  
  const tableRows = useMemo(() => {
    return Object.values(reportResult)
  }, [reportResult]);

  const tableColumns = {
    date: 'Date',
    gatewayName: 'Gateway',
    paymentId: 'Transaction ID',
    amount: 'Amount',
  };

  const generateReport = useCallback(async () => {
    console.log("s = ", startDateValue, endDateValue, moment(startDateValue).format("YYYY-MM-DD"))
    const reportRes = await fetch('http://178.63.13.157:8090/mock-api/api/report', {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        ...(project !== "all" && { 'projectId': project }),
        ...(gateway !== "all" && { 'gatewayId': project }),
        from: moment(startDateValue).format("YYYY-MM-DD"),
        to: moment(endDateValue).format("YYYY-MM-DD"),
      })
    });
    const { data: reports } = await reportRes.json();
    const formatReport: ReportType = {}
    reports.forEach((report: ReportReponseType) => {
    if (!formatReport[report?.projectId]) {
      formatReport[report?.projectId] = {
        total : 0,
      };
    }

    formatReport[report?.projectId].gatewayName = getLabel(report.gatewayId, "gateway");
    formatReport[report?.projectId].amount = report.amount;
    formatReport[report?.projectId].total = formatReport[report?.projectId].total as number + report.amount;
    formatReport[report?.projectId].gatewayId = report.gatewayId;
    formatReport[report?.projectId].date = report.created;
    formatReport[report?.projectId].paymentId = report.paymentId;
    });

    setReportResult(formatReport);
  }, []);

  const getTitle = (projectId: string) => {
    const label = getLabel(projectId, 'project');
    return (
      <div className='flex justify-between'>
        <span>
          {label}
        </span>
        <span className='uppercase'>
          Total: {formatCurrency(reportResult[projectId].total as number) as string} USD
        </span>
      </div>
    )
  }


  return (
    <>
      <AppBar position="static" color="inherit">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <img src="logo.png" className="mr-5" />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1  }} >
              <MenuIcon sx={{ display: { xs: 'none', md: 'flex' }, color: '#005B96'}} />
            </Typography>
            <div className='bg-[#F6CA65] h-[43px] w-[43px] rounded-[5px] font-bold leading-[27px] text-[23px] flex justify-center items-center mr-[11px] text-white'> JD</div>
            <Typography className='text-[#005B96]'>
              John Doe
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
      <div className='flex gap-10'>
        <div className='flex flex-col gap-[27px] px-9 py-10'>
          <CreditCardTwoToneIcon sx={{ color: '#CDCCCC'}}/>
          <GridViewTwoToneIcon sx={{ color: '#CDCCCC'}} />
          <ComputerTwoToneIcon sx={{ color: '#CDCCCC'}} />
          <PieChartIcon sx={{ color: '#005B96'}} />
          <PowerSettingsNewTwoToneIcon sx={{ color: '#CDCCCC'}} />
        </div>
        <div className='py-9 w-full pr-[100px]'>
          <div className='flex justify-between'>
            <h2 className='text-[#005B96] font-bold text-[24px] leading-[28px]'>
              Reports
              <p className='text-[#7E8299] text-[16px] leading-[19px] pt-1'>Easily generate a report of your transactions</p>
            </h2>
            <div className='flex gap-x-5'>
              {!!projects.length && <SelectComp options={formatProjectOptions(projects)} label="Projects" onSelectClickHandler={onProjectChange} /> }
              {!!gateways.length && <SelectComp options={formatGatewayOptions(gateways)} label="Gateways" onSelectClickHandler={onGatewayChange} />}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MuiDatePicker
                  value={startDateValue}
                  onChange={(newValue: any) => {  
                    setStartDateValue(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  inputFormat="DD-MM-YYYY"
                  maxDate={new Date('2021-12-30')}
                  minDate={new Date('2021-01-01')}
                  className={`h-[32px] min-w-[135px] !bg-[#1BC5BD] !text-white custom-select !ring-0 !ring-[#1BC5BD] custom-date-picker rounded-[5px] w-[150px]`}
                />
                <MuiDatePicker
                  value={endDateValue}
                  onChange={(newValue: any) => {
                    setEndDateValue(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                  inputFormat="DD-MM-YYYY"
                  maxDate={new Date('2021-12-31')}
                  minDate={new Date('2021-01-02')}
                  className={`h-[32px] min-w-[135px] !bg-[#1BC5BD] !text-white custom-select !ring-0 !ring-[#1BC5BD] custom-date-picker rounded-[5px] w-[150px]`}
                />
              </LocalizationProvider>
              <Button variant="contained" className='h-[32px] px-2.5 py-2 !normal-case !bg-[#005B96]' onClick={generateReport}>Generate report</Button>
            </div>
          </div>
          <div className='flex w-full gap-8'>
            <div className='mt-7 py-7 bg-[#F1FAFE] px-[19px] w-6/12'>
              <h2 className='text-[#005B96] font-bold text-[16px] leading-[18px] mb-8'>
                {getLabel(project, 'project')} | {getLabel(gateway, 'gateway')}
              </h2>
              <List>
                {
                  Object.keys(reportResult).map((projectId) => {
                    return (
                      <ListItem key={projectId} title={getTitle(projectId)} containerClass="!py-[14px]" itemClass="!bg-white !text-[#011F4B] font-bold text-[16px] leading-[19px] !p-6">
                        <AppTable rows={tableRows} columns={tableColumns}/>
                      </ListItem>
                    )
                  })
                }
              </List>
            </div>
            <div className='mt-7 py-7 bg-[#F1FAFE] px-[19px] w-6/12'>
              {/* graph */}
              <h2 className='text-[#005B96] font-bold text-[16px] leading-[18px] mb-8'>
                <Doughnut data={{...doughnutData}} />
              </h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;