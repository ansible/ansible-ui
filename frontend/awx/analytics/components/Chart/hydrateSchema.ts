import { ChartSchemaElement, ChartType } from 'react-json-chart-builder';
import { AttributeType } from '../Toolbar/types';
/**
 * I have strong hunch that you can use one function to hydrate
 * the schema and return a plain function with the hydrated schema
 * which can be used. This would optimize the code much more, since
 * we would not neet to run JSON stringify and parse + replace
 * mthods all the time. However the slowdown is pretty small,
 * so I left it as is for now.
 *
 * @param schema The stringified version of the schema.
 * @returns The hidrated schema with passed variables.
 */
const hydrateSchema =
  (schema: ChartSchemaElement[]) =>
  (props: {
    label?: string;
    y?: string;
    xTickFormat?: string;
    chartType?: ChartType;
    tooltip: string;
    field: AttributeType;
  }) => {
    if (!props) {
      return schema;
    }
    let hydratedSchema = JSON.stringify(schema);
    Object.entries(props).forEach((arr) => {
      const regVar = new RegExp(`VAR_${arr[0]}`, 'g');
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      hydratedSchema = hydratedSchema.replace(regVar, `${arr[1]}`);
    });

    return JSON.parse(hydratedSchema) as ChartSchemaElement[];
  };

export default hydrateSchema;
