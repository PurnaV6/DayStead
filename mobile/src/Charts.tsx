import React from 'react';
import {View,Text} from 'react-native';
import Svg,{Circle,Polyline,Line} from 'react-native-svg';
import {Occurrence,pounds} from './domain';
const palette=['#2D6554','#9CBCA6','#D4A864','#809EB7','#AD91B9','#D0CCC2'];
export function BillCharts({current,previous}:{current:Occurrence[];previous:Occurrence[]}){
 const groups:Record<string,number>={};current.forEach(o=>groups[o.schedule.category]=(groups[o.schedule.category]||0)+(o.schedule.amount_pence||0));
 const total=current.reduce((s,o)=>s+(o.schedule.amount_pence||0),0),prior=previous.reduce((s,o)=>s+(o.schedule.amount_pence||0),0);
 let offset=0; const circumference=2*Math.PI*58;
 const points=(items:Occurrence[])=>Array.from({length:31},(_,i)=>({x:12+i*9,y:120-items.filter(o=>o.at.getDate()<=i+1).reduce((s,o)=>s+(o.schedule.amount_pence||0),0)/Math.max(total,prior,1)*100})).map(p=>`${p.x},${p.y}`).join(' ');
 return <View style={{gap:16}}><Text style={{fontSize:20,fontWeight:'600',color:'#193D31'}}>Where your money goes</Text>
 <View style={{flexDirection:'row',alignItems:'center',gap:16}}><Svg width={146} height={146} viewBox="0 0 146 146"><Circle cx={73} cy={73} r={58} stroke="#EEEDE7" strokeWidth={19} fill="none"/>{Object.entries(groups).map(([label,value],i)=>{const len=total?value/total*circumference:0;const start=offset;offset+=len;return <Circle key={label} cx={73} cy={73} r={58} stroke={palette[i%palette.length]} strokeWidth={19} fill="none" strokeDasharray={`${len} ${circumference-len}`} strokeDashoffset={-start} rotation={-90} origin="73,73"/>})}</Svg><View style={{flex:1,gap:8}}>{Object.entries(groups).map(([label,value],i)=><Text key={label} style={{color:palette[i%palette.length],fontSize:13}}>● {label} · {pounds(value)}</Text>)}{!current.length&&<Text>No bills this month</Text>}</View></View>
 <Text style={{fontSize:20,fontWeight:'600',color:'#193D31'}}>Monthly bill trend</Text><Text style={{color:'#68756E'}}>Cumulative scheduled bills · this month vs last month</Text>
 <Svg width="100%" height={145} viewBox="0 0 300 145"><Line x1={12} x2={282} y1={120} y2={120} stroke="#D8DFD7"/>{previous.length>0&&<Polyline points={points(previous)} fill="none" stroke="#B1B6AD" strokeWidth={3} strokeDasharray="5 5"/>}{current.length>0&&<Polyline points={points(current)} fill="none" stroke="#2D6554" strokeWidth={3}/>}</Svg>
 <Text style={{color:'#68756E'}}>1st                         15th                         31st</Text>
 <Text style={{color:'#193D31'}}>{!previous.length?'No previous-month data to compare.':`${pounds(Math.abs(total-prior))} ${total>=prior?'more':'less'} than last month${prior?' · '+Math.abs((total-prior)/prior*100).toFixed(1)+'%':''}`}</Text></View>;
}
