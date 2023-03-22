import { ChartData, ChartDataSerie } from 'react-json-chart-builder';
import { v4 as uuidv4 } from 'uuid';
import { ApiReturnType, ApiType, GroupedApi } from './types';

export const convertGroupedByData = (data: GroupedApi): ChartDataSerie[] => {
  const { dates } = data;
  const items: ChartDataSerie[] = [];
  dates.forEach((el) => {
    // Add items to the correct serie
    el.items.forEach((item, idx) => {
      if (!items[idx]) {
        items[idx] = {
          serie: [],
          hidden: false,
          name: uuidv4(),
        };
      }
      items[idx].serie.push({
        created_date: el.date,
        ...item,
      });
    });
  });
  return items;
};

export const convertApiToData = (result: ApiReturnType): ChartData => {
  const data: ChartData = {
    series: [],
    legend: [],
  };

  if ('dates' in result) {
    result.type = ApiType.grouped;
  } else {
    result.type = ApiType.nonGrouped;
  }

  switch (result.type) {
    case ApiType.grouped:
      data.series = convertGroupedByData(result);
      break;
    case ApiType.nonGrouped:
      data.series = [
        {
          serie: result.items || result.meta.legend,
          hidden: false,
          name: uuidv4(),
        },
      ];
      break;
  }

  if (result.meta?.legend) {
    data.legend = result.meta.legend.map((item) => {
      const s = data.series.find(({ serie }) => {
        return serie.find(({ id: serieId }) => serieId === item.id);
      });
      return {
        ...item,
        childName: s && s.name ? s.name : '',
      };
    });
  }

  return data;
};
