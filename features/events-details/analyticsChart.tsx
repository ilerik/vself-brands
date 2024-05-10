import * as d3 from 'd3';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EventAction } from '../../models/Event';

const AnalyticsChart: React.FC<{
  event_actions: EventAction[];
  rewardsQnt: number;
  total_actions: number | undefined;
  total_users: number | undefined;
}> = ({ total_actions, total_users, event_actions, rewardsQnt }) => {

  const barref = useRef(null);
  const pieref = useRef(null);
  const [rewardsNumber, setRewardNumber] = useState<number[]>(new Array(rewardsQnt).fill(0));

  useEffect(() => {
    const rewardsNumber = new Array(rewardsQnt).fill(0);
    const rewardsData = new Map();
    event_actions.forEach((action) => {
      const { username, reward_index } = action;
      if (reward_index >= rewardsQnt) {
        return;
      }
      const userData = rewardsData.get(username);
      if (!userData) {
        rewardsData.set(username, new Set([reward_index]));
        rewardsNumber[reward_index]++;
        return;
      }
      if (userData.has(reward_index)) {
        return;
      }
      userData.add(reward_index);
      rewardsNumber[reward_index]++;
    });
    setRewardNumber(rewardsNumber);
  }, [rewardsQnt, event_actions]);

  const drawBarChart = useCallback(() => {
    const bars = ['Actions', 'Rewards', 'Users'];
    const svg = d3.select(barref.current),
      width = (svg.attr('width') as any) - 150,
      height = (svg.attr('height') as any) - 120;
    const dataset = [
      { value: total_actions },
      {
        // value: rewardsNumber.reduce((accumulator, currentValue) => {
        //   return accumulator + currentValue;
        // }, 0),
        value: rewardsQnt
      },
      { value: total_users },
    ];
    dataset.forEach(function (d: any, i: any) {
      d.index = i;
    });
    const xScale = d3
        .scaleBand()
        .domain(dataset.map((d: any) => d.index))
        .range([0, width])
        .padding(0.5),
      yScale = d3.scaleLinear().range([height, 0]);

    const g = svg.append('g').attr('transform', 'translate(' + 20 + ',' + 80 + ')');
    // xScale.domain(dataset);
    yScale.domain([0, Math.max(...dataset.map((d: any) => d.value))]);
    // yScale.domain([0, Math.max(...dataset.map((d: any) => Number(d)))]);


    g.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(
        d3.axisBottom(xScale).tickFormat(function (d: any, i: any) {
          return bars[i];
        })
      );

    g.append('g').call(
      d3
        .axisLeft(yScale)
        .tickFormat(function (d: any) {
          return d;
        })
        .ticks(4)
    );

    g.selectAll('.bar')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any, i: any): any => {
        return xScale(d.index);
      })
      .attr('y', function (d: any, i: any) {
        return yScale(d.value);
        // return yScale(Number(d));
      })
      .style('fill', 'steelblue')
      .attr('width', xScale.bandwidth())
      .attr('height', function (d: any) {
        return height - yScale(d.value);
        // return height - yScale(Number(d));
      });
  }, [rewardsNumber, total_actions, total_users]);

  const drawPieChart = useCallback(() => {
    const sum = rewardsNumber.reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);
    const chartData = [...rewardsNumber, event_actions.length - sum];
    const svg = d3.select(pieref.current),
      width = svg.attr('width'),
      height = svg.attr('height'),
      radius = Math.min(Number(width), Number(height)) / 2,
      g = svg.append('g').attr('transform', 'translate(' + Number(height) / 2 + ',' + Number(height) / 2 + ')');

    const color = d3.scaleOrdinal(['#4daf4a', '#377eb8', '#ff7f00', '#984ea3', '#e41a1c']);

    // Generate the pie
    const pie = d3
      .pie()
      .value(function (d: any) {
        return d;
      })
      .padAngle(0.1);

    // Generate the arcs
    const arc = d3.arc().innerRadius(80).outerRadius(radius);

    //Generate groups
    const arcs = g
      .selectAll('arc')
      .data(pie(chartData as any))
      .enter()
      .append('g')
      .attr('class', 'arc');

    //Draw arc paths
    arcs
      .append('path')
      .attr('fill', function (d: any, i: any) {
        return color(i);
      })
      .attr('d', arc as any)
      .append('text')
      .attr('transform', function (d: any) {
        return 'translate(' + arc.centroid(d) + ')';
      })
      .attr('text-anchor', 'middle')
      .text(function (d: any) {
        return d.value;
      });

    const legendG = g
      .selectAll('.legend')
      .data(pie(chartData as any))
      .enter()
      .append('g')
      .attr('transform', function (d, i) {
        return 'translate(' + 160 + ',' + -(i * 15 + 20) + ')';
      })
      .attr('class', 'legend');

    legendG
      .append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', function (d: any, i: any) {
        return color(i);
      });

    legendG
      .append('text')
      .text(function (d: any) {
        const reward = d.value >= rewardsQnt ? 'No reward' : 'Reward ' + d.index;
        return ' ' + reward;
      })
      .style('font-size', 12)
      .style('color', 'black')
      .attr('y', 10)
      .attr('x', 11);
  }, [event_actions.length, rewardsNumber, rewardsQnt]);

  useEffect(
    function drawCharts() {
      d3.selectAll('g').remove();
      if (barref.current) {
        drawBarChart();
      }
      if (pieref.current) {
        drawPieChart();
      }
    },
    [drawBarChart, drawPieChart]
  );
  return (
    <div className="flex w-full">
      <div className="w-1/2">
        <h3 className="text-[20px] font-interBold mb-[20px]">Activity</h3>
        <svg width="400" height="300" ref={barref}></svg>
      </div>
      <div className="w-1/2">
        <h3 className="text-[20px] font-interBold mb-[20px]">Rewards</h3>
        <svg width="400" height="300" ref={pieref}></svg>
      </div>
    </div>
  );
};

export default AnalyticsChart;
