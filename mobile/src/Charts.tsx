import React from 'react';
import {View,Text} from 'react-native';
import Svg,{Circle,Polyline,Line} from 'react-native-svg';
import {Occurrence,pounds} from './domain';
const palette=['#2D6554','#9CBCA6','#D4A864','#809EB7','#AD91B9','#D0CCC2'];
const total=(items:Occurrence[])=>items.reduce((s,o)=>s+(o.schedule.amount_pence||0),0);
// Category donut with the month total in the middle. With no bills it shows an empty grey ring and £0.00.
export function BillDonut({current,size=146}:{current:Occurrence[];size?:number}){
 const groups:Record<string,number>={};current.forEach(o=>groups[o.schedule.category]=(groups[o.schedule.category]||0)+(o.schedule.amount_pence||0));
 const sum=total(current),entries=Object.entries(groups).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
 const circumference=2*Math.PI*58;
 const arcs=entries.map(([label,value],i)=>({label,len:sum?value/sum*circumference:0,start:entries.slice(0,i).reduce((n,[,v])=>n+(sum?v/sum*circumference:0),0)}));
 return <View style={{flexDirection:'row',alignItems:'center',gap:16}}>
  <View style={{width:size,height:size,alignItems:'center',justifyContent:'center'}}><Svg width={size} height={size} viewBox="0 0 146 146" style={{position:'absolute'}}><Circle cx={73} cy={73} r={58} stroke="#EEEDE7" strokeWidth={19} fill="none"/>{arcs.map(({label,len,start},i)=><Circle key={label} cx={73} cy={73} r={58} stroke={palette[i%palette.length]} strokeWidth={19} fill="none" strokeDasharray={`${len} ${circumference-len}`} strokeDashoffset={-start} rotation={-90} origin="73,73"/>)}</Svg><Text style={{fontSize:11,color:'#68756E'}}>Total</Text><Text numberOfLines={1} adjustsFontSizeToFit style={{fontSize:size>=170?19:15,fontWeight:'700',color:'#193D31',maxWidth:size*.62,textAlign:'center'}}>{pounds(sum)}</Text></View>
  <View style={{flex:1,gap:8}}>{entries.map(([label,value],i)=><Text key={label} style={{color:'#193D31',fontSize:13}}><Text style={{color:palette[i%palette.length]}}>●</Text> {label} · {pounds(value)}</Text>)}{!entries.length&&<Text style={{color:'#68756E',fontSize:14,lineHeight:21}}>No bills this month yet. Tap + to add your first bill and the chart fills in.</Text>}</View>
 </View>;
}
export function BillCharts({current,previous}:{current:Occurrence[];previous:Occurrence[]}){
 const sum=total(current),prior=total(previous);
 const points=(items:Occurrence[])=>Array.from({length:31},(_,i)=>({x:12+i*9,y:120-items.filter(o=>o.at.getDate()<=i+1).reduce((s,o)=>s+(o.schedule.amount_pence||0),0)/Math.max(sum,prior,1)*100})).map(p=>`${p.x},${p.y}`).join(' ');
 return <View style={{gap:16}}><Text style={{fontSize:20,fontWeight:'600',color:'#193D31'}}>Where your money goes</Text>
 <BillDonut current={current}/>
 <Text style={{fontSize:20,fontWeight:'600',color:'#193D31'}}>Monthly bill trend</Text><Text style={{color:'#68756E'}}>Cumulative scheduled bills · this month vs last month</Text>
 <Svg width="100%" height={145} viewBox="0 0 300 145"><Line x1={12} x2={282} y1={120} y2={120} stroke="#D8DFD7"/>{previous.length>0&&<Polyline points={points(previous)} fill="none" stroke="#B1B6AD" strokeWidth={3} strokeDasharray="5 5"/>}{current.length>0&&<Polyline points={points(current)} fill="none" stroke="#2D6554" strokeWidth={3}/>}</Svg>
 <Text style={{color:'#68756E'}}>1st                         15th                         31st</Text>
 <Text style={{color:'#193D31'}}>{!previous.length?'No previous-month data to compare.':`${pounds(Math.abs(sum-prior))} ${sum>=prior?'more':'less'} than last month${prior?' · '+Math.abs((sum-prior)/prior*100).toFixed(1)+'%':''}`}</Text></View>;
}
