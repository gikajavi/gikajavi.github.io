function fN(n) {
    // var formatValue = d3.format("0,000");
    return (Math.round(n*10)/10).toString()
        .replace(",", ";")
        .replace(".", ",")
        .replace(";", ".")
}


// Tooltip hover mapa
var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")


// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoCylindricalStereographic()
    .scale(100);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

// Totes les dades (netejades prèviament)
let dataset = []
// Diccionari de països (per saber ràpidament si existeixen en l'enquesta)
let countriesDic = {}
let totalWithCountry = 0;


let countryMap2CountrySurvey = function(mapName) {
    // Mismatch entre alguns noms de països a l'enquesta i al mapa. Almenys arreglem els més obvis
    if (mapName === 'Russia') {
        return 'Russian Federation';
    }
    if (mapName === 'USA') {
        return 'United States';
    }
    if (mapName === 'England') {
        return 'United Kingdom';
    }
    return mapName;
}

let countryExistInSurvey = function(d) {
    return countriesDic[countryMap2CountrySurvey(d.name)];
}


// Load external data and boot
console.log('queue start');

d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/gikajavi/stackoverflow-survey-2018/main/ds_cleaned-min.csv", function(d) {
        dataset.push(d);
    })
    .await(ready);

function ready(error, topo) {
    // Compteig d'algunes dades
    dataset.forEach(ele => {
        if (ele.Country !== 'NA') {
            totalWithCountry++;
            if (!(ele.Country in countriesDic)) {
                countriesDic[ele.Country] = {}
                countriesDic[ele.Country].total = 0;
                countriesDic[ele.Country].male = 0;
                countriesDic[ele.Country].female = 0;
                countriesDic[ele.Country].others = 0;
            }
            countriesDic[ele.Country].total++;
            if (ele.Gender !== 'NA') {
                if (ele.Gender === 'Female') {
                    countriesDic[ele.Country].female++
                } else if (ele.Gender === 'Male') {
                    countriesDic[ele.Country].male++
                } else {
                    countriesDic[ele.Country].others++
                }
            }
        }
    })



    let mouseMove = function(d) {
        let ht = ''

        let countName = d.properties.name;
        if (countryExistInSurvey({ id: d.id, name: d.properties.name })) {

            let curCount = countriesDic[countryMap2CountrySurvey(countName)];
            ht = `<div>${JSON.stringify(curCount)}</div>`;
            let percen = fN(curCount.total / totalWithCountry * 100);
            if (percen == '0') {
                percen = '< 0,01';
            }

            let totalGender = curCount.male + curCount.female + curCount.others;
            let percenMale = fN(curCount.male / totalGender * 100);
            let percenFemale = fN(curCount.female / totalGender * 100);
            let percenOthers = fN(curCount.others / totalGender * 100);

            ht = `<div>                    
                    <div style="margin-bottom: 5px;"><b>${countName}</b> (${percen}%)</div>
                    <div class="row">                        
                        <div class="col-4"><i class="fas fa-female"></i> ${percenFemale}%</div>
                        <div class="col-4"><i class="fas fa-male"></i> ${percenMale}%</div>                        
                        <div class="col-4"><i class="fas fa-venus-mars"></i> ${percenOthers}%</div>
                    </div>
                </div>`;

        } else {
            ht = `<div><b>${countName}</b><br/>(Sense dades)</div>`;
        }

        div.style("opacity", 1);
        div
            .html( ht )
            .style("left", function () {
                if (d3.event.pageX > 780) {
                    return d3.event.pageX - 180 + "px";
                } else {
                    return d3.event.pageX + 23 + "px";
                }
            })
            .style("top", d3.event.pageY - 20 + "px")
            .style("width", "auto");
    }

    let mouseOver = function(d) {
        // console.log(d)
        d3.selectAll(".Country")
            .transition()
            .duration(100)
            .style("opacity", .4)
        d3.select(this)
            .transition()
            .duration(100)
            .style("opacity", 1)
            .style("cursor", 'hand')
            // .style("stroke", "black")
    }

    let mouseLeave = function(d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .6)

        div.style("opacity", 0);
        // d3.select(this)
        //     .transition()
        //     .duration(200)
        //     .style("stroke", "transparent")
    }

    let mouseClick = function(d) {


// set the dimensions and margins of the graph
        var margin = {top: 20, right: 30, bottom: 40, left: 90},
            width = 460 - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;

// append the svg object to the body of the page
        var svg = d3.select("#charts")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
        d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum_header.csv", function(data) {

            // Add X axis
            var x = d3.scaleLinear()
                .domain([0, 13000])
                .range([ 0, width]);
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

            // Y axis
            var y = d3.scaleBand()
                .range([ 0, height ])
                .domain(data.map(function(d) { return d.Country; }))
                .padding(.1);
            svg.append("g")
                .call(d3.axisLeft(y))

            //Bars
            svg.selectAll("myRect")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", x(0) )
                .attr("y", function(d) { return y(d.Country); })
                .attr("width", function(d) { return x(d.Value); })
                .attr("height", y.bandwidth() )
                .attr("fill", "#69b3a2")


            // .attr("x", function(d) { return x(d.Country); })
            // .attr("y", function(d) { return y(d.Value); })
            // .attr("width", x.bandwidth())
            // .attr("height", function(d) { return height - y(d.Value); })
            // .attr("fill", "#69b3a2")

        })
    }


    // Draw the map
    // Veure aquí com filtrar Antàrtida
    // https://bl.ocks.org/Fil/8277a0a590dec3debf142bcd1e827416
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            return countryExistInSurvey( { id: d.id, name: d.properties.name })
                ?  '#3498db' : '#ccc';
        })
        .style("stroke", "transparent")
        .attr("class", function(d){ return "Country" } )
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mousemove", mouseMove )
        .on("mouseleave", mouseLeave )
        .on("click",  mouseClick )
}