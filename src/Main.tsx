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
import { report } from 'process';
import { type } from 'os';

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

type ChartDatasetsType = {
  label: string,
  data: Array<number>,
  backgroundColor: Array<string>,
  borderColor: Array<string>,
  borderWidth: number,
}
type DoughnutChartDataType = {
  labels: Array<string>,
  datasets: Array<ChartDatasetsType>,
}

type GraphLabelType = {
  label: string,
  color: string,
}

const doughnutData: DoughnutChartDataType = {
  labels: [],
  datasets: [
    {
      label: 'Total',
      data: [],
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
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [startDateValue, setStartDateValue] = useState<any>(new Date('2021-01-01'));
  const [endDateValue, setEndDateValue] = useState<any>(new Date('2021-12-31'));
  const [reportResult, setReportResult]=  useState<ReportType>({});
  const [graphData, setGraphData]=  useState<DoughnutChartDataType>(doughnutData);
  const [graphLabels, setGraphLabels]=  useState<Array<GraphLabelType>>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0); 


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

  // useEffect(() => {
  //   if ((project !== "all" && gateway === "all") || (gateway !== "all" && project === "all")) {
  //     formatGraphData();
  //   }
  // }, [reportResult, project, gateway])

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

  const formatGraphData = () => {
    const labels: Array<GraphLabelType> = [];
    let graphTotal = 0;
    Object.keys(reportResult).forEach((projectId, index) => {
      doughnutData.datasets?.[0].data.push(reportResult[projectId].total as number);
      labels.push({
        label: getLabel(projectId, "project"),
        color: doughnutData.datasets[0].backgroundColor[index],
      });
      graphTotal += reportResult[projectId].total as number;
    });

    setGraphData(doughnutData);
    setGraphLabels(labels);
    setGrandTotal(graphTotal);
  }

  const generateReport = useCallback(async () => {
    const reportRes = await fetch('http://178.63.13.157:8090/mock-api/api/report', {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        ...(project !== "all" && { 'projectId': project }),
        ...(gateway !== "all" && { 'gatewayId': gateway }),
        from: moment(startDateValue).format("YYYY-MM-DD"),
        to: moment(endDateValue).format("YYYY-MM-DD"),
      })
    });
    const { data: reports } = await reportRes.json();
    const formatReport: ReportType = {}
    reports.forEach((report: ReportReponseType) => {
    if (project === "all" && !formatReport[report?.projectId]) {
      formatReport[report?.projectId] = {
        total : 0,
      };
    } else if (project !== "all" && !formatReport[report?.projectId]) {
      formatReport[report?.gatewayId] = {
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
    if ((project !== "all" && gateway === "all") || (gateway !== "all" && project === "all")) {
      setShowGraph(true);
      formatGraphData();
    }
  }, [project, gateway, getLabel, startDateValue, endDateValue]);

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

  const generateGraphLabel = (label: GraphLabelType) => {
    return (
      <div key={label.label} className='flex justify-center items-center gap-1'>
        <div className="w-[15px] h-[15px] rounded-[5px]" style={{backgroundColor: `${label.color}`}}></div>
        <div>
          {label.label}
        </div>
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
            <div className='mt-7 py-7 bg-[#F1FAFE] px-[19px] w-full'>
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
            {showGraph && (
              <div className='px-[19px]'>
                <div className='mt-7 py-7 bg-[#F1FAFE] px-[19px] w-full flex gap-3'>
                  {
                    graphLabels.map((label) => {
                      return generateGraphLabel(label);
                    })
                  }
                </div>
                <Doughnut data={{...graphData}} />
                <div className='mt-7 py-7 bg-[#F1FAFE] px-[19px]'>
                  <h2 className='text-[#005B96] font-bold text-[16px] leading-[18px]'>
                    Gateway Total | {formatCurrency(grandTotal) as string} USD
                  </h2>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;