import ApexCharts from 'apexcharts'

datajson = {}
Promise.all([
    // loadData(
    //   "https://s3.eu-central-1.amazonaws.com/fusion.store/ft/data/line-chart-with-time-axis-data.json"
    // ),
    loadData(datajson)
      
    
  ]).then(function(res) {
    const data = res[0];
    const schema = res[1];
  
    const dataStore = new FusionCharts.DataStore();
    const dataSource = {
      chart: {},
      caption: {
        text: "Sales Analysis"
      },
      subcaption: {
        text: "Grocery"
      },
      yaxis: [
        {
          plot: {
            value: "Grocery Sales Value"
          },
          format: {
            prefix: "$"
          },
          title: "Sale Value"
        }
      ]
    };
    dataSource.data = dataStore.createDataTable(data, schema);
  
    new FusionCharts({
      type: "timeseries",
      renderAt: "chart-container",
      width: "100%",
      height: "500",
      dataSource: dataSource
    }).render();
  });