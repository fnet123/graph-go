! function(){
    let json = transData(DATAS)
    console.log(json)

    makeGV(DATAS)
    
    let myChart = echarts.init(document.getElementById('chart-panel'))
    myChart.hideLoading();
        myChart.setOption(option = {
            title: {
                text: 'Go Std Dependencies'
            },
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            series : [
                {
                    type: 'graph',
                    layout: 'none',
                    data: json.nodes.map(function (node) {
                        let position = rangdomPosition()
    
                        return {
                            x: position.x,
                            y: position.y,
                            id: node.id,
                            name: node.label,
                            symbolSize: node.size,
                            itemStyle: {
                                normal: {
                                    color: randomRGB()
                                }
                            }
                        };
                    }),
                    edges: json.edges.map(function (edge) {
                        return {
                            source: edge.sourceID,
                            target: edge.targetID
                        };
                    }),
                    label: {
                        emphasis: {
                            position: 'right',
                            show: true
                        }
                    },
                    roam: true,
                    focusNodeAdjacency: true,
                    lineStyle: {
                        normal: {
                            width: 0.5,
                            curveness: 0.3,
                            opacity: 0.7
                        }
                    }
                }
            ]
        }, true);
    
        /* 随机颜色. */
        function randomRGB() {
            var o = Math.round, r = Math.random, s = 255;
            return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s)  + ')';
        }
    
        /* 产生随机数. */
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    
        /* 产生随机坐标. */
        function rangdomPosition(){
            let min = -1000;
            let max = 1000;
            return {
                x: getRandomInt(min,max),
                y: getRandomInt(min,max),
            }
        }
    
        /* 将原始数据,转换为图标友好的数据. 
        ImportPath 作为唯一 id 和 标签;
        Imports 用于计算依赖关系;
        节点的大小,取决于被依赖的次数;
        */
        function transData(datas){
            /* 存储依赖路径信息. */
            let edges = []

            /* 存储基础节点信息. */
            let nodes = []

            /* 节点尺寸.初始是1, 每被引入一次再加1. */
            let nodedSize = {}

            /* 尺寸单位1. */
            let unitSize = 1.5

            datas.map((data)=>{
                let itemId = data.ImportPath

                nodes.push({
                    "label": itemId,
                    "attributes": {},
                    "id": itemId,
                    "size": 1
                })

                if(data.Imports){
                    data.Imports.map((importItem)=>{
                        edges.push({
                            "sourceID": importItem,
                            "attributes": {},
                            "targetID": itemId,
                            "size": unitSize
                        })
    
                        if(nodedSize[importItem]){
                            nodedSize[importItem] = nodedSize[importItem] + unitSize
                        }else{
                            nodedSize[importItem] = unitSize
                        }
                    })
                }
            })

            /* 尺寸数据合并到节点上. */
            nodes.map((item)=>{
                let itemId = item.id
                if(nodedSize[itemId]){
                    item.size = nodedSize[itemId]
                }
            })

            return {
                nodes,edges
            }
        }
    
    /* 生成 graphviz 图.需要把输出单独保存为 .gv 文件,并使用 graphviz 打开渲染. */
    function makeGV(datas){
        let gv = `strict digraph {\n`

        /* 存储依赖路径信息. */
        let edges = []
        
        /* 存储基础节点信息. */
        let nodes = []

        datas.map((data,idx)=>{
            let itemId = cleanImportPath(data.ImportPath)

            nodes.push(`${itemId} [label="${data.ImportPath}"]`)

            if(data.Imports){
                data.Imports.map((importItem)=>{
                    let sourceItemId = cleanImportPath(importItem)

                    edges.push(`${sourceItemId} -> ${itemId}`)
                })
            }
        })

        nodes.map((item)=>{
            gv += item+'\n'
        })
        edges.map((item)=>{
            gv += item+'\n'
        })
        gv += `}`

        console.log(gv)
    }

    /* 去除 ImportPath 中的 / . 等特殊符号. */
    function cleanImportPath(aPath){
        return aPath.replace(/[\/|\.]/g, "_")
    }
}()