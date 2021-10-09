import { boot } from 'quasar/wrappers'

import { use } from 'echarts/core'
import {CanvasRenderer} from 'echarts/renderers'

import {
  LineChart, PieChart
} from 'echarts/charts'

import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent
])

export default boot(async ( { app } ) => {
  use([
    CanvasRenderer,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    ToolboxComponent,

    LineChart,
    PieChart
  ]);
})
