import React, { useCallback, useEffect, useState } from 'react';
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
import { Button } from '@mui/material';
import ListItem from './components/list/ListItem';
import { SelectComp, SelectOptionsType } from './components/select/Select';

function Main() {
  const [projects, setProjects] = useState<Array<any>>([])
  const [gateways, setGateways] = useState<Array<any>>([])
  const [gateway, setGateway] = useState<string>("all")
  const [project, setProject] = useState<string>("all")
  useEffect(() => {
    (async function () {
      const [gatewayResponse, projectsResponse] = await Promise.all([fetch("http://178.63.13.157:8090/mock-api/api/gateways"), fetch("http://178.63.13.157:8090/mock-api/api/projects")]);
      const { data: gatewayData, error: gatewayError } = await gatewayResponse.json();
      const { data, error } = await projectsResponse.json();
      formatProjectOptions(data)
      formatGatewayOptions(gatewayData)
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

      setProjects(formattedData)
  }

  const formatGatewayOptions = (data: any[]) => {
    const formattedData: Array<SelectOptionsType> = [{label: "All Gateways", value: "all"}]
      data.forEach((project) => {
        formattedData.push({
          label: project.name,
          value: project.gatewayId,
        })
      })
      setGateways(formattedData)
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
        return  gateways.find((gateway) => gateway.value === value)?.label;
      case "project":
        return projects.find((project) => project.value === value)?.label;
      default:
        return "";
    }
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
              {!!projects.length && <SelectComp options={projects} label="Projects" onSelectClickHandler={onProjectChange} /> }
              {!!gateways.length && <SelectComp options={gateways} label="Gateways" onSelectClickHandler={onGatewayChange} />}
              <Button variant="contained" className='h-[32px] px-2.5 py-2 !normal-case !bg-[#005B96]'>Generate report</Button>
            </div>
          </div>
          <div className='mt-7 py-7 bg-[#F1FAFE] px-[19px]'>
            <h2 className='text-[#005B96] font-bold text-[16px] leading-[18px] mb-8'>
              {getLabel(project, 'project')} | {getLabel(gateway, 'gateway')}
            </h2>
          <ListItem title="List header" itemClass="!bg-white !text-[#011F4B] font-bold text-[16px] leading-[19px] !p-6">
            Table
          </ListItem>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;