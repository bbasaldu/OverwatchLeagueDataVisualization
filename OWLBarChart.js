var width = 1100;
var height = 600;
var body = d3.select('body');
var div = body.append('div').attr('width', '100%').attr('height', height).attr('align', 'center')
var svg = div.append('svg')
    .attr('width', width).attr('height', height).attr('transform', 'translate(0 0)')
//need to fix wierd auto positioning of dropdown menu when i increase the window width 
var divmenu = div.append('div').style('position', 'relative')//.style('display', 'inline-block')//div space is equal to fit its contents
    .style('left', ((width/2)+5)+'px').style('top', (-height + 80)+'px')
    .style('width', '200px')
    .style('height', '300px')
    .style('padding-left', 0).style('padding-right', 0).style('margin', '10px').style('border', '0px')
    .append('ul').style('list-style-type', 'none')

var maps = [
    {mapType: 'Control', maps: ["Busan", "Ilios", "Lijiang Tower", "Nepal", "Oasis"]},
    {mapType: 'Assault', maps: ["Hanamura", "Temple of Anubis", "Volskaya Industries"]},
    {mapType: 'Escort', maps: ["Dorado", "Havana", "Junkertown", "Rialto", "Route 66", "Watchpoint: Gibraltar"]},
    {mapType: 'Hybrid', maps: ["Blizzard World", "Eichenwalde", "Hollywood", "King's Row", "Numbani"]}
]
var label = divmenu.append('li').append('label').attr('for', 'map-select').style('display', 'inline-block')
    .style('width', '200px')
    .style('font-family', 'Verdana').text('Choose a map: ')
var select = divmenu.append('li').attr('cursor', 'pointer').append('select').attr('name', 'map-select').attr('id', 'map-select')
    .style('font-family', 'Verdana').style('display', 'inline-block').style('text-align-last', 'center')

//ugly hacky code i used to make a quick dropdown info box

var featuresdiv = divmenu.append('li').append('div')
    .style('position', 'relative')
    .style('top', '10px')
    .style('width', '185px')
    .style('height', '20px')
    .style('border-style', 'solid').style('border-bottom-style', 'none')
    .style('border-radius', '2px')
    .style('border-bottom-left-radius', '0px').style('border-bottom-right-radius', '0px')
    .style('border-width', '1px')
    .style('border-color', 'grey')
    .style('background-color', 'none')
    .style('overflow-wrap', 'break-word').style('overflow', 'hidden')
    .style('cursor', 'pointer')
    .attr('clicked', 'false')
    .style('font', '12px Verdana')
    .html("<div style='text-align: center;'> Features/Sources(click me) </div>")

var maskdiv = divmenu.append('li').append('div')
    .style('pointer-events', 'none')
    .style('position', 'relative')
    .style('top', '-9px')
    .style('width', '185px')
    .style('height', '20px')
    .style('border-style', 'solid')
    .style('border-top-style', 'none')
    .style('border-radius', '2px')
    .style('border-top-left-radius', '0px')
    .style('border-top-right-radius', '0px')
    .style('border-width', '1px')
    .style('border-color', 'grey')
    .style('background-color', 'none')
    .style('text-align', 'left').style('font', '10px Verdana')
    .style('overflow-wrap', 'break-word').style('overflow', 'hidden')
    //.append('div').html("<br><br>Data taken from <a href='https://overwatchleague.com/en-us/statslab'>Overwatch League Website</a>")
    .html("<br><br> <text style='pointer-events:auto;'>Click bar to remove it, exposing a mini circle that represents the bar data at the bottom</text><br>"+
         "<br><text style='pointer-events:auto;'>Click mini circle to re-enter bar data to chart</text><br>"+
         "<br><text style='pointer-events:auto;'>Data taken from <a href='https://overwatchleague.com/en-us/statslab'>Overwatch League Website</a></text><br>"+
         "<br><text style='pointer-events:auto;'>D3 javascript library for data visualization used</text><br>")
    

featuresdiv.on('click', () =>{
    if(featuresdiv.attr('clicked') == 'false'){
        maskdiv.transition().duration(500).style('height', '180px')
        featuresdiv.attr('clicked', 'true')
    }
    else {
        maskdiv.transition().duration(500).style('height', '20px')
        featuresdiv.attr('clicked', 'false')
    }
})


maps.forEach(d => {
    var optgroup = select.append('optgroup').attr('label', d.mapType)
    d.maps.forEach(dd => optgroup.append('option').attr('value', dd).text(dd))
})
//images from owl api that had team logos in svg and png format
var team_names = ["Atlanta_Reign", "Boston_Uprising", "Chengdu_Hunters", "Dallas_Fuel", 
             "Florida_Mayhem", "Guangzhou_Charge", "Hangzhou_Spark", "Houston_Outlaws", 
             "London_Spitfire", "Los_Angeles_Gladiators", "Los_Angeles_Valiant",
             "New_York_Excelsior", "Paris_Eternal", "Philadelphia_Fusion", "San_Francisco_Shock",
             "Seoul_Dynasty", "Shanghai_Dragons", "Toronto_Defiant", "Vancouver_Titans", "Washington_Justice"]

var promises = [
    d3.csv('match_map_stats.csv'),
    d3.csv('new_owl_colors.csv')
]
team_names.forEach(name => promises.push(d3.xml(`${name}.svg`)))
//'The paths in your SVGs will need to have unique class names or else their styles will overwrite each other.'
//http://zevross.com/blog/2019/08/20/load-external-svgs-with-d3-v5/
Promise.all(promises).then(function(rawcsv){
    //console.log(rawcsv)
    
    //to use svgs more than once i need to clone them for each use. Info from same link above
    var nodes = [];
    for(var i=2; i<=21; i++) nodes.push(d3.select(rawcsv[i].documentElement))
    nodes.forEach(d => {
        var clone = d.node().cloneNode(true);
        svg.node().appendChild(clone);
    })
    
    var logos = svg.selectAll('svg')
    
    var map_stats = rawcsv[0].filter(d => d.stage == "OWL 2020 Regular Season")
    
    function updateMap(map){
        var array = [];
        map_stats.forEach((d,i) =>{
            if(d.map_name == map){
                var next = map_stats[i+1];
                if(typeof next != 'undefined' && (d.game_number != next.game_number)) updateStats(d, array)
                else if(typeof next == 'undefined') updateStats(d, array)
            }
        })
        array.sort((a,b) => sortByName(a,b))
        array.forEach((d,i) => d.index = i)
        return array;
    }
    
    function updateStats(d, stats){
        var winner = d.map_winner;
        var loser = d.map_loser;
        var team1 = stats.find(obj => obj.group == d.team_one_name)
        var team2 = stats.find(obj => obj.group == d.team_two_name)
        if(typeof team1 == 'undefined'){
            var wins = 0;
            var losses = 0;
            var draws = 0;
            if(winner == d.team_one_name) wins = 1;
            else if(loser == d.team_one_name) losses = 1;
            else draws = 1;
            var value = (wins == 0) ? 0 : (wins/(wins+losses+draws));
            stats.push({group: d.team_one_name, win:wins, loss:losses, draw: draws, val:value, index: 0,
                        id: d.team_one_name.split(' ').join('_')})
        }
        else if(typeof team1 != 'undefined'){
            //console.log('here')
            var wins = team1.win;
            var losses = team1.loss;
            var draws = team1.draw;
            if(winner == d.team_one_name) wins += 1;
            else if(loser == d.team_one_name) losses += 1;
            else draws += 1;
            team1.win = wins; team1.loss = losses; team1.draw = draws;
            team1.val = (wins == 0) ? 0 : (wins/(wins+losses+draws));
        }
        if(typeof team2 == 'undefined'){
            var wins = 0;
            var losses = 0;
            var draws = 0;
            if(winner == d.team_two_name) wins = 1;
            else if(loser == d.team_two_name) losses = 1;
            else draws = 1;
            var value = (wins == 0) ? 0 : (wins/(wins+losses+draws));
            stats.push({group: d.team_two_name, win:wins, loss:losses, draw: draws, val:value, index: 0,
                        id: d.team_two_name.split(' ').join('_')})
        }
        else if(typeof team2 != 'undefined'){
            var wins = team2.win;
            var losses = team2.loss;
            var draws = team2.draw;
            if(winner == d.team_two_name) wins += 1;
            else if(loser == d.team_two_name) losses += 1;
            else draws += 1;
            team2.win = wins; team2.loss = losses; team2.draw = draws;
            team2.val = (wins == 0) ? 0 : (wins/(wins+losses+draws));
        }
    }
    
    function sortByName(a,b){
        var nameA = a.group.toUpperCase(); // ignore upper and lowercase
        var nameB = b.group.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
            }
        if (nameA > nameB) {
            return 1;
            }
        // names must be equal
        return 0;
    }
    
    var data = updateMap('Busan');//stats;
    console.log(data)
    
    var axisWidth = width-200;
    var axisHeight = height-230;
    var offsetLeft = 100;
    var globalFont = '12px Verdana';
    
    var x = d3.scaleBand()
                .domain(data.map(d => d.group))
                .range([0, axisWidth])
                .padding(0.2);
    
    var ogx = d3.scaleBand()
                .domain(data.map(d => d.group))
                .range([0, axisWidth])
                .padding(0.2);
    
    var ymax = d3.max(data, d => d.val);
    var y = d3.scaleLinear()
            .domain([0, ymax])
            .range([axisHeight, 20]).nice();

    var xAxis = d3.axisBottom(x).tickSizeOuter(0);
    var yAxis = d3.axisLeft(y).tickFormat(d3.format(".0%"));

    var xAxisGroup = svg.append('g').attr('transform', 'translate('+offsetLeft+','+(axisHeight)+')').attr('opacity', 0)
    var yAxisGroup = svg.append('g').attr('transform', 'translate('+offsetLeft+', 0)').attr('opacity', 0)
    xAxisGroup.transition().ease(d3.easeCubicOut).duration(2000).attr('opacity', 1).call(xAxis)//not drawn until here
    yAxisGroup.transition().ease(d3.easeCubicOut).duration(2000).attr('opacity', 1).call(yAxis)
    
    var labels = xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-30)').attr('cursor', 'pointer')
        .style('text-anchor', 'end').style('font', globalFont)
    yAxisGroup.selectAll('text').style('font-family', globalFont)
    
    logos.data(data)
        .attr('class', 'logos')
        .attr('x', d => x(d.group) + offsetLeft)
        .attr('y', d => axisHeight)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('pointer-events', 'none')
    
    var newData = data;
    var rects = svg.selectAll('.bars')//had to change to .bars since the nyxl svg had a .rect
        .data(data).enter().append('rect')
        .attr('cursor', 'pointer')
        .attr('class', 'bars')
        .attr('id', d => d.id)
        .attr('x', d => x(d.group) + offsetLeft)
        .attr('y', d => axisHeight)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', d => rawcsv[1].find(e => d.group.includes(e.Team)).Primary)
    
    logos.raise()//put on top of bars
    
    var enterExitTime;
    var updateTime;
    var updateEase;
    var enterEase;
    
    select.on('change', () => {
        var updatedData = updateMap(d3.event.target.value)
        var easeType = (rects.data().length > updatedData.length) ? false : true;
        update(null, easeType, updatedData)
        if(typeof circles != 'undefined'){
            circles.attr('pointer-events','none')
                .transition().ease(updateEase).duration(updateTime).attr('opacity', 0).remove()
            Clogos.attr('pointer-events','none')
                .transition().ease(updateEase).duration(updateTime).attr('opacity', 0).remove()
        }
    })
    
    //also allow label to be clicked since some teams have 0 value so bar is non-existent lol
    labels.on('click', text => {
        var rect = d3.select('#'+text.split(' ').join('_'));
        var d = rect.data()[0];
        update(d, false, newData.filter(d2 => d2.group != d.group));
    })
    //logos.on('click', d => update(d, false, newData.filter(d2 => d2.group != d.group)));
    rects.on('click', d => update(d, false, newData.filter(d2 => d2.group != d.group)));
    logos.transition().ease(d3.easeCubicOut).duration(2000)
        .attr('y', d => y(d.val))
        .attr('height', d => axisHeight - y(d.val))
    rects.transition().ease(d3.easeCubicOut).duration(2000)
        .attr('y', d => y(d.val))
        .attr('height', d => axisHeight - y(d.val))
    //*** key function VERY important, by default creates update selection
    //by indices. EX: original array ([1, 4, 3]) -> new array [1, 3] gets rid of 3 instead of 4 since its looking
    //at the index, so *index 1 doesn't exist
    //so i have to state to match by values EX: ([1, 4, 3], d => d) gets rid of 4 since 4 doesn't exist
    //svg.node().append(rawcsv[8].documentElement)

    ////////////
    function update(thisd, isEnter, data){
        
        newData = data;
        //if data is entered or deleted
        if(isEnter){
            enterExitTime = 1500;
            enterEase = d3.easeCubicIn;
            updateTime = 1000;
            updateEase = d3.easeCubicOut;
        }
        else{
            enterExitTime = 500;
            enterEase = d3.easeCubicOut;
            updateTime = 1500;
            updateEase = d3.easeCubicIn;
            if(thisd != null) exitFunc(thisd)
        }
        if(thisd == null) rescaleY(data)
        x.domain(newData.map(d => d.group))
        xAxisGroup.transition().ease(updateEase).duration(updateTime).call(xAxis)
        var labels = xAxisGroup.selectAll('text').attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end').style('font', globalFont)
            .style('cursor', 'pointer')
        //to check if rects were removed earlier
        rects = svg.selectAll('.bars')
        logos = svg.selectAll('.logos')
        joinData(rects, data, 'bars')
        joinDataLogos(logos, data, 'logos')
        
        //for rects just entered
        rects = svg.selectAll('.bars')
        rects.on('click', d => update(d, false, newData.filter(d2 => d2.group != d.group)));
        
        //for labels just entered
        labels.on('click', text => {
                console.log(text)
                var rect = d3.select('#'+text.split(' ').join('_'));
                var d = rect.data()[0];
                update(d, false, newData.filter(d2 => d2.group != d.group));
        })
    }
    
    function joinData(elem, data, type){
        elem.data(data, d => d.group)
            .join(
                enter => //console.log(enter),
                enter.append('rect')//could use function() and do enter.trans later but .call looks cleaner with es6
                    .attr('cursor', 'pointer')
                    .attr('class', type)
                    .attr('id', d => d.id)
                    .attr('x', d => x(d.group) + offsetLeft)
                    .attr('y', d => axisHeight)
                    .attr('width', x.bandwidth())
                    .attr('height', 0)
                    .attr('fill', d => rawcsv[1].find(e => d.group.includes(e.Team)).Primary)
                    .call(enter => enter.transition().ease(enterEase).duration(updateTime)
                        .attr('height', d => axisHeight - y(d.val))
                        .attr('y', d => y(d.val))
                         ),
                update => //console.log(update),
                update.transition().ease(updateEase).duration(updateTime)
                    .attr('height', d => axisHeight - y(d.val))
                    .attr('y', d => y(d.val))
                    .attr('x', d => x(d.group) + offsetLeft)
                    .attr('width', x.bandwidth()),
                exit => //console.log(exit)
                exit.transition().ease(enterEase).duration(enterExitTime)
                    .attr('height', 0).attr('y', axisHeight).remove()
                )
    }
    
    function joinDataLogos(elem, data, type){
        
        elem.data(data, d => d.group)
            .join(
                enter => //console.log(enter.data()),
                enter.data().forEach(d => {
                    var clone = nodes[d.index].node().cloneNode(true);
                    var node = svg.node().appendChild(clone);
                    d3.select(node)
                        .datum(d)
                        .attr('class', 'logos')
                        .attr('pointer-events', 'none')
                        .attr('x', d => x(d.group) + offsetLeft)
                        .attr('y', axisHeight)
                        .attr('width', x.bandwidth())
                        .attr('height', 0)
                        .call(enter => enter.transition().ease(enterEase).duration(updateTime)
                            .attr('height', d => axisHeight - y(d.val))
                            .attr('y', d => y(d.val))
                         )
                }),
                update => //console.log(update),
                update.transition().ease(updateEase).duration(updateTime)
                    .attr('height', d => axisHeight - y(d.val))
                    .attr('y', d => y(d.val))
                    .attr('x', d => x(d.group) + offsetLeft)
                    .attr('width', x.bandwidth()),
                exit => //console.log(exit)
                exit.transition().ease(enterEase).duration(enterExitTime)
                    .attr('height', 0).attr('y', axisHeight).remove()
                )  
    }
    
    let circles;
    let Clogos;
    function exitFunc(d){
        
        var cx = ogx(d.group) + offsetLeft + (ogx.bandwidth()/2);
        var cy = axisHeight+120;
        var cr = 16;
        var groups = svg.selectAll('g'+(d.index+1))
            .data([d]).enter()
            .append('g').attr('opacity', 0).attr('id', 'groups')
            .attr('transform', `translate(${cx}, ${cy})`)//backticks, next to 1 key

        groups.append('circle').attr('cursor', 'pointer')
            .attr('r', cr+4)
            .attr('fill', d => rawcsv[1].find(e => d.group.includes(e.Team)).Primary)
        
        var clone = nodes[d.index].node().cloneNode(true);
        var node = svg.node().appendChild(clone)
        var logo = d3.select(node)
        
        logo.attr('pointer-events', 'none')
            .attr('class', 'Clogos')
            .attr('id', 'l'+d.index)
            .attr('opacity', 0)
            .attr('x', cx - cr).attr('y', cy - cr)
            .attr('height', cr * 2)
            .attr('width', cr * 2)
            
        groups.append('text')
            .attr('y', 30).attr('transform', 'rotate(-30)')
            .style('text-anchor', 'end').style('font', globalFont)
            .text(d.group)
        groups.transition().duration(enterExitTime).attr('opacity', 1)
        logo.transition().duration(enterExitTime).attr('opacity', 1)
        
        circles = d3.selectAll('#groups')
        Clogos = d3.selectAll('.Clogos')
        //text anchor*
        svg.selectAll('#groups').on('click', function(cd){
            var group = d3.select(this);
            var circle = group.selectAll('circle');
            var text = group.selectAll('text');
            var logo = d3.select('#l'+cd.index)
            
            logo.attr('opacity', 1)
                .transition(enterExitTime).attr('opacity',0)
                .on('end', () => logo.remove())
            circle.attr('pointer-events', 'none').attr('opacity', 1)
                .transition(enterExitTime).attr('opacity', 0)
            text.attr('opacity', 1)
                .transition(enterExitTime).attr('opacity',0)
                .on('end', () => group.remove())
            
            newData.push(cd);
            newData.sort((a,b) => a.index - b.index);
            update(cd, true, newData)
        })

    }
    function rescaleY(data){
        //console.log(data)
        ymax = d3.max(data, d => d.val);
        y.domain([0, ymax]).nice()
        yAxisGroup.transition().ease(updateEase).duration(updateTime).call(yAxis)
    }
/////////
})
