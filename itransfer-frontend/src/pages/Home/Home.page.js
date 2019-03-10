import React, { Component } from 'react';
import './Home.scss'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import GroupWorkIcon from '@material-ui/icons/GroupWork'
import GroupAddIcon from '@material-ui/icons/GroupAdd'
import EventIcon from '@material-ui/icons/Event'


export default class HomePage extends Component {
  constructor(props) {
    super(props);

    this.joinedUsers = [
      {
        name: '7 Feb', users: 23, pv: 2400, amt: 2400,
      },
      {
        name: '14 Feb', users: 43, pv: 1398, amt: 2210,
      },
      {
        name: '21 Feb', users: 12, pv: 9800, amt: 2290,
      },
      {
        name: '28 Feb', users: 78, pv: 3908, amt: 2000,
      },
    ];
    this.spaces = [
      {
        subject: 'Space 1', A: 120, B: 110, fullMark: 150,
      },
      {
        subject: 'Space 2', A: 98, B: 130, fullMark: 150,
      },
      {
        subject: 'Space 3', A: 86, B: 130, fullMark: 150,
      },
      {
        subject: 'Space 4', A: 99, B: 100, fullMark: 150,
      },
      {
        subject: 'Space 5', A: 85, B: 90, fullMark: 150,
      },
    ];
    this.rentedSpaces = [
      {
        name: 'Space 1', uv: 31.47, pv: 2400, fill: '#8884d8',
      },
      {
        name: 'Space 2', uv: 26.69, pv: 4567, fill: '#83a6ed',
      },
      {
        name: 'Space 3', uv: 15.69, pv: 1398, fill: '#8dd1e1',
      },
      {
        name: 'Space 4', uv: 8.22, pv: 9800, fill: '#82ca9d',
      },
      {
        name: 'Space 5', uv: 8.63, pv: 3908, fill: '#a4de6c',
      },
    ];
  }

  render() {
    const style = {
      top: 0,
      right: -50,
      lineHeight: '24px',
    };

    return (
      <div className="container">
        <h2 className="header">Dashboard</h2>
        <div className="grid three">
          <Card className="dashboard-card">
            <CardContent>
              <h2>Joined users</h2>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart
                  className="users-chart"
                  data={this.joinedUsers}
                  margin={{
                    top: 10, right: 30, left: 0, bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardContent>
              <h2>Rented spaces</h2>
              <ResponsiveContainer width='100%' height={300}>
                <RadialBarChart barSize={10} data={this.rentedSpaces}>
                  <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="uv" />
                  <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={style} />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardContent>
              <h2>Most frequented spaces</h2>
              <ResponsiveContainer width='100%' height={300}>
                <RadarChart data={this.spaces}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar name="Mike" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="grid">
          <Card className="action-card">
            <CardContent className="card-content">
              <div className="actions">
                <div className="action">
                  <GroupWorkIcon />
                  <span>Manage start-ups</span>
                </div>
                <div className="action">
                  <GroupAddIcon />
                  <span>Manage groups</span>
                </div>
                <div className="action">
                  <EventIcon />
                  <span>Input / Output</span>
                </div>
                <div className="action">
                  <GroupWorkIcon />
                  <span>Manage start-ups</span>
                </div>
                <div className="action">
                  <GroupWorkIcon />
                  <span>Manage start-ups</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}

