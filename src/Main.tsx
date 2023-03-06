import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import CreditCardTwoToneIcon from '@mui/icons-material/CreditCardTwoTone';
import GridViewTwoToneIcon from '@mui/icons-material/GridViewTwoTone';
import ComputerTwoToneIcon from '@mui/icons-material/ComputerTwoTone';
import PieChartIcon from '@mui/icons-material/PieChart';
import PowerSettingsNewTwoToneIcon from '@mui/icons-material/PowerSettingsNewTwoTone';
import ListItem from './components/list/ListItem';
import moment from 'moment';
import AppTable from './components/table/Table';
import List from './components/list/List';
import { formatCurrency } from './utils/CurrentFormat';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import dayjs from 'dayjs';
import { Header } from './components/header/Header';
import { Filter, FormInputType } from './components/filters/Filters';

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
  entityType?: string,
}

type ReportType = Record<string, Array<PorjectReportType>>
type ListReportType = Record<string, PorjectReportType>

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
  title: string,
  color: string,
  entityId?: string,
  entityType: "project" | "gateway",
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
  const [startDateValue, setStartDateValue] = useState<any>(dayjs(new Date('2021-01-01')));
  const [endDateValue, setEndDateValue] = useState<any>(dayjs(new Date('2021-12-31')));
  const [graphData, setGraphData]=  useState<DoughnutChartDataType>(doughnutData);
  const [graphLabels, setGraphLabels]=  useState<Array<GraphLabelType>>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0); 
  
  // table
  const [tableColumns, setTableColumns] = useState<Record<string, string>>({});
  const [reportTable, setReportTable] = useState<ReportType>({})
  const [reportList, setReportList] = useState<Record<string, PorjectReportType>>({})
  // const [reportResponse, setReportResponse] = useState<Array<ReportReponseType>>([])

  // generate report
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async function () {
      const [gatewayResponse, projectsResponse] = await Promise.all([fetch("http://178.63.13.157:8090/mock-api/api/gateways"), fetch("http://178.63.13.157:8090/mock-api/api/projects")]);
      const { data: gatewayData, error: gatewayError } = await gatewayResponse.json();
      const { data, error } = await projectsResponse.json();
      setProjects(data);
      setGateways(gatewayData);
      generateReportClickHandler(gatewayData, gateway, project);
    })();
  }, []);

  // Get chart labels
  const getLabel = (value: string, type: 'gateway' | 'project', data: Array<any> = []) => {
    switch (type) {
      case "gateway":
        if (value === "all") {
          return "All Gateways";
        }
        const gatewayList = gateways.length ?  gateways : data;
        return  gatewayList.find((gateway) => gateway.gatewayId === value)?.name;
      case "project":
        if (value === "all") {
          return "All Projects";
        }
        return projects.find((project) => project.projectId === value)?.name;
      default:
        return "";
    }
  }

  // Format graph data - doughnut
  const formatGraphData = (formatReportList: ListReportType) => {
    const labels: Array<GraphLabelType> = [];
    let graphTotal = 0;
    doughnutData.datasets[0].data = [];
    Object.keys(formatReportList).forEach((entityId, index) => {
      doughnutData.datasets?.[0].data.push(formatReportList[entityId].total as number);
      labels.push({
        title: getLabel(entityId, formatReportList[entityId].entityType as 'gateway' | 'project'),
        color: doughnutData.datasets[0].backgroundColor[index],
        entityId: entityId,
        entityType: formatReportList[entityId].entityType as 'gateway' | 'project',
      });
      graphTotal += formatReportList[entityId].total as number;
    });

    setGraphData(doughnutData);
    setGraphLabels(labels);
    setGrandTotal(graphTotal);
    setShowGraph(true);
  }

  // list data format
  //  {
  //   <entity_id>: {
  //       listType:
  //       total:
  //   }
  // }
  const generateListReport =async (reports: Array<ReportReponseType>, selectedGateway: string, selectedProject: string) => {
    const formatReportList: ListReportType = {};
    reports.forEach((report: ReportReponseType) => {
      let entityId = report?.projectId;
      let entityType = "project";
      if (selectedProject === "all" && selectedGateway === "all") {
        // show projects list and gateway name col
        entityId = report?.projectId;
        entityType = "project";
      } else if (selectedProject !== "all" && selectedGateway !== "all") {
        // no list just table
      } else {
        if (selectedProject !== "all" && selectedGateway === "all") {
          // show gateway list
          entityId = report?.gatewayId;
          entityType = "gateway";
        } else if (selectedGateway !== "all" && selectedProject === "all") {
          // show project list, no gateway col
          entityId = report?.projectId;
          entityType = "project";
        }
      }

      if (!formatReportList[entityId]) {
        formatReportList[entityId] = {
          total: 0,
        };
      }
      formatReportList[entityId].total = formatReportList[entityId].total as number + report.amount;
      formatReportList[entityId].entityType = entityType;
    });

    setReportList(formatReportList);

    if (selectedGateway === "all" || selectedProject === "all") {
      formatGraphData(formatReportList);
    } else {
      setShowGraph(false);
    }
  }
  // table format
  // {
  //   <entity_id>: [
  //     {
  //       amount:
  //       date:  
  //       paymentId:
  //     }
  //   ]
  // }
  const generateReportTableColumns = (selectedGateway: string, selectedProject: string) => {
    const tableCols = {
      date: 'Date',
      ...(selectedProject === "all" && selectedGateway === "all" && { gatewayName: 'Gateway' }),
      paymentId: 'Transaction ID',
      amount: 'Amount',
    };
    setTableColumns(tableCols);
  }

  const generateTableReport = (reports: Array<ReportReponseType>, gatewayData: any, selectedGateway: string, selectedProject: string) => {
    const formatReportTable: ReportType = {};

    reports.forEach((report: ReportReponseType) => {
      let entityId = report?.projectId;
      let entityType = "project";
      if (selectedProject === "all" && selectedGateway === "all") {
        // show projects list and gateway name col
        entityId = report?.projectId;
        entityType = "project";
      } else if (selectedProject !== "all" && selectedGateway !== "all") {
        // no list just table
        entityId = "both";
        entityType = "both";
      } else {
        if (selectedProject !== "all" && selectedGateway === "all") {
          // show gateway list
          entityId = report?.gatewayId;
          entityType = "gateway";
        } else if (selectedGateway !== "all" && selectedProject === "all") {
          // show project list, no gateway col
          entityId = report?.projectId;
          entityType = "project";
        }
      }

      if (!formatReportTable[entityId]) {
        formatReportTable[entityId] = [];
      }

      const entityTableReport: PorjectReportType = {
        amount: report.amount,
        gatewayName: getLabel(report.gatewayId, "gateway", gatewayData),
        gatewayId: report.gatewayId,
        date: report.created,
        paymentId: report.paymentId,
      };

      formatReportTable[entityId].push(entityTableReport);
    });

    generateReportTableColumns(selectedGateway, selectedProject);
    setReportTable(formatReportTable);
    setIsLoading(false);
  }

  // Get report
  // Generate report list and table
  const generateReportClickHandler = async (gatewayData?: any, selectedGateway?: string, selectedProject?: string) => {
    const reportRes = await fetch('http://178.63.13.157:8090/mock-api/api/report', {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        ...(selectedProject !== "all" && { 'projectId': selectedProject }),
        ...(selectedGateway !== "all" && { 'gatewayId': selectedGateway }),
        from: moment(startDateValue.$d).format("YYYY-MM-DD"),
        to: moment(endDateValue.$d).format("YYYY-MM-DD"),
      })
    });
    const { data: reports } = await reportRes.json();
    // setReportResponse(reports);
    generateListReport(reports, selectedGateway as string, selectedProject as string);
    generateTableReport(reports, gatewayData, selectedGateway as string, selectedProject as string);
  }

  const getTitle = (entityId: string, listType: 'gateway' | 'project') => {
    const label = getLabel(entityId, listType);
    return (
      <div className='flex justify-between'>
        <span>
          {label}
        </span>
        <span className='uppercase'>
          Total: {formatCurrency(reportList[entityId].total as number) as string} USD
        </span>
      </div>
    )
  }

  const generateGraphLabel = (label: GraphLabelType) => {
    if (!label.title) {
      label.title = getLabel(label?.entityId as string, label.entityType as 'gateway' | 'project');
    }

    return (
      <div key={label?.title} className='flex justify-center items-center gap-1'>
        <div className="w-[15px] h-[15px] rounded-[5px]" style={{backgroundColor: `${label.color}`}}></div>
        <div>
          {label.title}
        </div>
      </div>
    )
  }

  const formSubmitHandler =  (formValues: FormInputType) => {
    setIsLoading(true);
    setShowGraph(false);
    const {
      selectedGateway,
      selectedProject,
      selectedStartDate,
      selectedEndDate,
    } = formValues;
    setGateway(selectedGateway);
    setProject(selectedProject);
    setEndDateValue(selectedEndDate);
    setStartDateValue(selectedStartDate);
    generateReportClickHandler(gateways, selectedGateway, selectedProject);
  }

  return (
    <>
      <Header />
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
            <Filter
              onFormSubmitHandler={(formValues) => formSubmitHandler(formValues)}
              gateways={gateways}
              projects={projects}
            />
          </div>
          <div className='flex w-full gap-8'>
            {
              isLoading && <>Loading...</>
            }
            {!isLoading && (
              <div className='mt-7 py-7 bg-[#F1FAFE] px-[19px] w-full'>
                <h2 className='text-[#005B96] font-bold text-[16px] leading-[18px] mb-8'>
                  {getLabel(project, 'project')} | {getLabel(gateway, 'gateway')}
                </h2>
                {(project === "all" || gateway === "all") && (
                  <List>
                    {
                      Object.keys(reportList).map((entityId) => {
                        return (
                          <ListItem
                            key={entityId}
                            title={getTitle(entityId, reportList[entityId].entityType as 'gateway' | 'project')}
                            containerClass="!py-[14px]"
                            itemClass="!bg-white !text-[#011F4B] font-bold text-[16px] leading-[19px] !p-6"
                          >
                            <AppTable rows={reportTable[entityId]} columns={tableColumns}/>
                          </ListItem>
                        )
                      })
                    }
                  </List>
                )}
                {
                  project !== "all" && gateway !== "all" && reportTable && reportTable.both && (
                    <AppTable rows={reportTable?.both} columns={tableColumns} />
                  )
                }
              </div>
            )}
            {!isLoading && showGraph && (
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