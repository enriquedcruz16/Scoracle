import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

const API_KEY = "b08f6877d56ad565b8dbb49558b764eb";
const API_BASE = "https://v3.football.api-sports.io";
const LEAGUE_ID = 1; const SEASON = 2026;
const LOCK_MINUTES = 15;
const PTS_EXACT = 10; const PTS_RESULT = 5; const PTS_WINNER = 50; const PTS_BONUS = 10;
const ADMIN_ID = "0c51030f-a4ce-4e6c-8c4c-87ffba2acae2";
const G = "#f59e0b";

const GROUPS_TEAMS = {
  A:["Mexico","South Korea","South Africa","Czechia"],
  B:["Canada","Switzerland","Qatar","Bosnia-Herzegovina"],
  C:["Brazil","Morocco","Haiti","Scotland"],
  D:["USA","Paraguay","Australia","Türkiye"],
  E:["Germany","Curaçao","Ivory Coast","Ecuador"],
  F:["Netherlands","Japan","Sweden","Tunisia"],
  G:["Belgium","Egypt","Iran","New Zealand"],
  H:["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I:["France","Senegal","Iraq","Norway"],
  J:["Argentina","Algeria","Austria","Jordan"],
  K:["Portugal","DR Congo","Uzbekistan","Colombia"],
  L:["England","Croatia","Ghana","Panama"],
};
const GROUPS_LIST = Object.keys(GROUPS_TEAMS);
const ALL_TEAMS = Object.values(GROUPS_TEAMS).flat();

const FLAGS = {
  Mexico:"🇲🇽","South Korea":"🇰🇷","South Africa":"🇿🇦",Czechia:"🇨🇿",Canada:"🇨🇦",Switzerland:"🇨🇭",Qatar:"🇶🇦","Bosnia-Herzegovina":"🇧🇦",
  Brazil:"🇧🇷",Morocco:"🇲🇦",Haiti:"🇭🇹",Scotland:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",USA:"🇺🇸",Paraguay:"🇵🇾",Australia:"🇦🇺","Türkiye":"🇹🇷",
  Germany:"🇩🇪","Curaçao":"🇨🇼","Ivory Coast":"🇨🇮",Ecuador:"🇪🇨",Netherlands:"🇳🇱",Japan:"🇯🇵",Sweden:"🇸🇪",Tunisia:"🇹🇳",
  Belgium:"🇧🇪",Egypt:"🇪🇬",Iran:"🇮🇷","New Zealand":"🇳🇿",Spain:"🇪🇸","Cape Verde":"🇨🇻","Saudi Arabia":"🇸🇦",Uruguay:"🇺🇾",
  France:"🇫🇷",Senegal:"🇸🇳",Iraq:"🇮🇶",Norway:"🇳🇴",Argentina:"🇦🇷",Algeria:"🇩🇿",Austria:"🇦🇹",Jordan:"🇯🇴",
  Portugal:"🇵🇹","DR Congo":"🇨🇩",Uzbekistan:"🇺🇿",Colombia:"🇨🇴",England:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",Croatia:"🇭🇷",Ghana:"🇬🇭",Panama:"🇵🇦",
};

const MD1 = [
  {id:"s_A1",group:"A",home:"Mexico",away:"South Africa",date:"Jun 11",time:"21:00",venue:"Estadio Azteca, Mexico City",kickoffISO:"2026-06-11T21:00:00-05:00"},
  {id:"s_A2",group:"A",home:"South Korea",away:"Czechia",date:"Jun 11",time:"21:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-11T21:00:00-06:00"},
  {id:"s_B1",group:"B",home:"Canada",away:"Bosnia-Herzegovina",date:"Jun 12",time:"20:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-12T20:00:00-04:00"},
  {id:"s_D1",group:"D",home:"USA",away:"Paraguay",date:"Jun 12",time:"21:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-12T21:00:00-07:00"},
  {id:"s_B2",group:"B",home:"Qatar",away:"Switzerland",date:"Jun 13",time:"20:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-13T20:00:00-07:00"},
  {id:"s_C1",group:"C",home:"Brazil",away:"Morocco",date:"Jun 13",time:"23:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-13T23:00:00-04:00"},
  {id:"s_C2",group:"C",home:"Haiti",away:"Scotland",date:"Jun 14",time:"02:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-14T02:00:00-04:00"},
  {id:"s_D2",group:"D",home:"Australia",away:"Türkiye",date:"Jun 14",time:"02:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-14T02:00:00-07:00"},
  {id:"s_E1",group:"E",home:"Germany",away:"Curaçao",date:"Jun 14",time:"18:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-14T18:00:00-05:00"},
  {id:"s_F1",group:"F",home:"Netherlands",away:"Japan",date:"Jun 14",time:"21:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-14T21:00:00-05:00"},
  {id:"s_E2",group:"E",home:"Ivory Coast",away:"Ecuador",date:"Jun 15",time:"00:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-15T00:00:00-04:00"},
  {id:"s_F2",group:"F",home:"Tunisia",away:"Sweden",date:"Jun 15",time:"03:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-15T03:00:00-06:00"},
  {id:"s_H1",group:"H",home:"Spain",away:"Cape Verde",date:"Jun 15",time:"18:00",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-15T18:00:00-04:00"},
  {id:"s_G1",group:"G",home:"Belgium",away:"Egypt",date:"Jun 15",time:"21:00",venue:"Lumen Field, Seattle",kickoffISO:"2026-06-15T21:00:00-07:00"},
  {id:"s_H2",group:"H",home:"Saudi Arabia",away:"Uruguay",date:"Jun 16",time:"00:00",venue:"Hard Rock Stadium, Miami",kickoffISO:"2026-06-16T00:00:00-04:00"},
  {id:"s_G2",group:"G",home:"Iran",away:"New Zealand",date:"Jun 16",time:"03:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-16T03:00:00-07:00"},
  {id:"s_I1",group:"I",home:"France",away:"Senegal",date:"Jun 16",time:"20:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-16T20:00:00-04:00"},
  {id:"s_I2",group:"I",home:"Iraq",away:"Norway",date:"Jun 16",time:"23:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-16T23:00:00-04:00"},
  {id:"s_J1",group:"J",home:"Argentina",away:"Algeria",date:"Jun 17",time:"02:00",venue:"Arrowhead Stadium, Kansas City",kickoffISO:"2026-06-17T02:00:00-05:00"},
  {id:"s_J2",group:"J",home:"Austria",away:"Jordan",date:"Jun 17",time:"05:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-17T05:00:00-07:00"},
  {id:"s_K1",group:"K",home:"Portugal",away:"DR Congo",date:"Jun 17",time:"18:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-17T18:00:00-05:00"},
  {id:"s_L1",group:"L",home:"England",away:"Croatia",date:"Jun 17",time:"21:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-17T21:00:00-05:00"},
  {id:"s_L2",group:"L",home:"Ghana",away:"Panama",date:"Jun 18",time:"00:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-18T00:00:00-04:00"},
  {id:"s_K2",group:"K",home:"Uzbekistan",away:"Colombia",date:"Jun 18",time:"03:00",venue:"Estadio Azteca, Mexico City",kickoffISO:"2026-06-18T03:00:00-05:00"},
];
const MD2 = [
  {id:"s_A3",group:"A",home:"South Africa",away:"Czechia",date:"Jun 18",time:"18:00",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-18T18:00:00-04:00"},
  {id:"s_B3",group:"B",home:"Switzerland",away:"Bosnia-Herzegovina",date:"Jun 18",time:"20:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-18T20:00:00-07:00"},
  {id:"s_B4",group:"B",home:"Canada",away:"Qatar",date:"Jun 18",time:"23:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-18T23:00:00-07:00"},
  {id:"s_A4",group:"A",home:"Mexico",away:"South Korea",date:"Jun 19",time:"02:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-19T02:00:00-06:00"},
  {id:"s_D3",group:"D",home:"USA",away:"Australia",date:"Jun 19",time:"20:00",venue:"Lumen Field, Seattle",kickoffISO:"2026-06-19T20:00:00-07:00"},
  {id:"s_C3",group:"C",home:"Scotland",away:"Morocco",date:"Jun 19",time:"23:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-19T23:00:00-04:00"},
  {id:"s_C4",group:"C",home:"Brazil",away:"Haiti",date:"Jun 20",time:"02:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-20T02:00:00-04:00"},
  {id:"s_D4",group:"D",home:"Türkiye",away:"Paraguay",date:"Jun 20",time:"05:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-20T05:00:00-07:00"},
  {id:"s_F3",group:"F",home:"Netherlands",away:"Sweden",date:"Jun 20",time:"18:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-20T18:00:00-05:00"},
  {id:"s_E3",group:"E",home:"Germany",away:"Ivory Coast",date:"Jun 20",time:"21:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-20T21:00:00-04:00"},
  {id:"s_E4",group:"E",home:"Ecuador",away:"Curaçao",date:"Jun 21",time:"00:00",venue:"Arrowhead Stadium, Kansas City",kickoffISO:"2026-06-21T00:00:00-05:00"},
  {id:"s_F4",group:"F",home:"Tunisia",away:"Japan",date:"Jun 21",time:"03:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-21T03:00:00-06:00"},
  {id:"s_H3",group:"H",home:"Spain",away:"Saudi Arabia",date:"Jun 21",time:"18:00",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-21T18:00:00-04:00"},
  {id:"s_G3",group:"G",home:"Belgium",away:"Iran",date:"Jun 21",time:"20:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-21T20:00:00-07:00"},
  {id:"s_H4",group:"H",home:"Uruguay",away:"Cape Verde",date:"Jun 21",time:"23:00",venue:"Hard Rock Stadium, Miami",kickoffISO:"2026-06-21T23:00:00-04:00"},
  {id:"s_G4",group:"G",home:"New Zealand",away:"Egypt",date:"Jun 22",time:"02:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-22T02:00:00-07:00"},
  {id:"s_J3",group:"J",home:"Argentina",away:"Austria",date:"Jun 22",time:"18:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-22T18:00:00-05:00"},
  {id:"s_I3",group:"I",home:"France",away:"Iraq",date:"Jun 22",time:"22:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-22T22:00:00-04:00"},
  {id:"s_I4",group:"I",home:"Norway",away:"Senegal",date:"Jun 23",time:"01:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-23T01:00:00-04:00"},
  {id:"s_J4",group:"J",home:"Jordan",away:"Algeria",date:"Jun 23",time:"04:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-23T04:00:00-07:00"},
  {id:"s_K3",group:"K",home:"Portugal",away:"Uzbekistan",date:"Jun 23",time:"18:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-23T18:00:00-05:00"},
  {id:"s_L3",group:"L",home:"England",away:"Ghana",date:"Jun 23",time:"21:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-23T21:00:00-04:00"},
  {id:"s_L4",group:"L",home:"Panama",away:"Croatia",date:"Jun 24",time:"00:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-24T00:00:00-04:00"},
  {id:"s_K4",group:"K",home:"Colombia",away:"DR Congo",date:"Jun 24",time:"03:00",venue:"Estadio Azteca, Mexico City",kickoffISO:"2026-06-24T03:00:00-05:00"},
];
const MD3 = [
  {id:"s_B5",group:"B",home:"Switzerland",away:"Canada",date:"Jun 24",time:"20:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-24T20:00:00-07:00"},
  {id:"s_B6",group:"B",home:"Bosnia-Herzegovina",away:"Qatar",date:"Jun 24",time:"20:00",venue:"Lumen Field, Seattle",kickoffISO:"2026-06-24T20:00:00-07:00"},
  {id:"s_C5",group:"C",home:"Scotland",away:"Brazil",date:"Jun 24",time:"23:00",venue:"Hard Rock Stadium, Miami",kickoffISO:"2026-06-24T23:00:00-04:00"},
  {id:"s_C6",group:"C",home:"Morocco",away:"Haiti",date:"Jun 24",time:"23:00",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-24T23:00:00-04:00"},
  {id:"s_A5",group:"A",home:"Czechia",away:"Mexico",date:"Jun 25",time:"02:00",venue:"Estadio Azteca, Mexico City",kickoffISO:"2026-06-25T02:00:00-05:00"},
  {id:"s_A6",group:"A",home:"South Africa",away:"South Korea",date:"Jun 25",time:"02:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-25T02:00:00-06:00"},
  {id:"s_E5",group:"E",home:"Ecuador",away:"Germany",date:"Jun 25",time:"21:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-25T21:00:00-04:00"},
  {id:"s_E6",group:"E",home:"Curaçao",away:"Ivory Coast",date:"Jun 25",time:"21:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-25T21:00:00-04:00"},
  {id:"s_F5",group:"F",home:"Japan",away:"Sweden",date:"Jun 26",time:"00:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-26T00:00:00-05:00"},
  {id:"s_F6",group:"F",home:"Tunisia",away:"Netherlands",date:"Jun 26",time:"00:00",venue:"Arrowhead Stadium, Kansas City",kickoffISO:"2026-06-26T00:00:00-05:00"},
  {id:"s_D5",group:"D",home:"Türkiye",away:"USA",date:"Jun 26",time:"03:00",venue:"SoFi Stadium, Los Angeles",kickoffISO:"2026-06-26T03:00:00-07:00"},
  {id:"s_D6",group:"D",home:"Paraguay",away:"Australia",date:"Jun 26",time:"03:00",venue:"Levi's Stadium, San Francisco",kickoffISO:"2026-06-26T03:00:00-07:00"},
  {id:"s_I5",group:"I",home:"Norway",away:"France",date:"Jun 26",time:"20:00",venue:"Gillette Stadium, Boston",kickoffISO:"2026-06-26T20:00:00-04:00"},
  {id:"s_I6",group:"I",home:"Senegal",away:"Iraq",date:"Jun 26",time:"20:00",venue:"BMO Field, Toronto",kickoffISO:"2026-06-26T20:00:00-04:00"},
  {id:"s_H5",group:"H",home:"Cape Verde",away:"Saudi Arabia",date:"Jun 27",time:"00:00",venue:"NRG Stadium, Houston",kickoffISO:"2026-06-27T00:00:00-05:00"},
  {id:"s_H6",group:"H",home:"Uruguay",away:"Spain",date:"Jun 27",time:"00:00",venue:"Estadio Akron, Guadalajara",kickoffISO:"2026-06-27T00:00:00-06:00"},
  {id:"s_G5",group:"G",home:"Egypt",away:"Iran",date:"Jun 27",time:"03:00",venue:"Lumen Field, Seattle",kickoffISO:"2026-06-27T03:00:00-07:00"},
  {id:"s_G6",group:"G",home:"New Zealand",away:"Belgium",date:"Jun 27",time:"03:00",venue:"BC Place, Vancouver",kickoffISO:"2026-06-27T03:00:00-07:00"},
  {id:"s_L5",group:"L",home:"Panama",away:"England",date:"Jun 27",time:"22:00",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-06-27T22:00:00-04:00"},
  {id:"s_L6",group:"L",home:"Croatia",away:"Ghana",date:"Jun 27",time:"22:00",venue:"Lincoln Financial, Philadelphia",kickoffISO:"2026-06-27T22:00:00-04:00"},
  {id:"s_K5",group:"K",home:"Colombia",away:"Portugal",date:"Jun 28",time:"00:30",venue:"Hard Rock Stadium, Miami",kickoffISO:"2026-06-28T00:30:00-04:00"},
  {id:"s_K6",group:"K",home:"DR Congo",away:"Uzbekistan",date:"Jun 28",time:"00:30",venue:"Mercedes-Benz Stadium, Atlanta",kickoffISO:"2026-06-28T00:30:00-04:00"},
  {id:"s_J5",group:"J",home:"Algeria",away:"Austria",date:"Jun 28",time:"03:00",venue:"Arrowhead Stadium, Kansas City",kickoffISO:"2026-06-28T03:00:00-05:00"},
  {id:"s_J6",group:"J",home:"Jordan",away:"Argentina",date:"Jun 28",time:"03:00",venue:"AT&T Stadium, Dallas",kickoffISO:"2026-06-28T03:00:00-05:00"},
];

const STATIC_MATCHDAYS = [
  {day:1,label:"Matchday 1",dates:"Jun 11–17",fixtures:MD1},
  {day:2,label:"Matchday 2",dates:"Jun 18–23",fixtures:MD2},
  {day:3,label:"Matchday 3",dates:"Jun 24–28",fixtures:MD3},
];

// ── Knockout bracket placeholder (used before API has data) ──
const KNOCKOUT_BRACKET = [
  {day:4,label:"Round of 32",dates:"Jun 29 – Jul 2",fixtures:[
    {id:"k_r32_1",group:"R32",home:"1A",away:"2B",date:"Jun 29",time:"TBD",venue:"TBD",kickoffISO:"2026-06-29T20:00:00-05:00",isKnockout:true},
    {id:"k_r32_2",group:"R32",home:"1C",away:"2D",date:"Jun 29",time:"TBD",venue:"TBD",kickoffISO:"2026-06-29T23:00:00-05:00",isKnockout:true},
    {id:"k_r32_3",group:"R32",home:"1E",away:"2F",date:"Jun 30",time:"TBD",venue:"TBD",kickoffISO:"2026-06-30T20:00:00-05:00",isKnockout:true},
    {id:"k_r32_4",group:"R32",home:"1G",away:"2H",date:"Jun 30",time:"TBD",venue:"TBD",kickoffISO:"2026-06-30T23:00:00-05:00",isKnockout:true},
    {id:"k_r32_5",group:"R32",home:"1B",away:"2A",date:"Jul 1",time:"TBD",venue:"TBD",kickoffISO:"2026-07-01T20:00:00-05:00",isKnockout:true},
    {id:"k_r32_6",group:"R32",home:"1D",away:"2C",date:"Jul 1",time:"TBD",venue:"TBD",kickoffISO:"2026-07-01T23:00:00-05:00",isKnockout:true},
    {id:"k_r32_7",group:"R32",home:"1F",away:"2E",date:"Jul 2",time:"TBD",venue:"TBD",kickoffISO:"2026-07-02T20:00:00-05:00",isKnockout:true},
    {id:"k_r32_8",group:"R32",home:"1H",away:"2G",date:"Jul 2",time:"TBD",venue:"TBD",kickoffISO:"2026-07-02T23:00:00-05:00",isKnockout:true},
    {id:"k_r32_9",group:"R32",home:"1I",away:"2J",date:"Jul 3",time:"TBD",venue:"TBD",kickoffISO:"2026-07-03T20:00:00-05:00",isKnockout:true},
    {id:"k_r32_10",group:"R32",home:"1K",away:"2L",date:"Jul 3",time:"TBD",venue:"TBD",kickoffISO:"2026-07-03T23:00:00-05:00",isKnockout:true},
    {id:"k_r32_11",group:"R32",home:"1J",away:"2I",date:"Jul 4",time:"TBD",venue:"TBD",kickoffISO:"2026-07-04T20:00:00-05:00",isKnockout:true},
    {id:"k_r32_12",group:"R32",home:"1L",away:"2K",date:"Jul 4",time:"TBD",venue:"TBD",kickoffISO:"2026-07-04T23:00:00-05:00",isKnockout:true},
    {id:"k_r32_13",group:"R32",home:"3rd-1",away:"3rd-2",date:"Jul 5",time:"TBD",venue:"TBD",kickoffISO:"2026-07-05T20:00:00-05:00",isKnockout:true},
    {id:"k_r32_14",group:"R32",home:"3rd-3",away:"3rd-4",date:"Jul 5",time:"TBD",venue:"TBD",kickoffISO:"2026-07-05T23:00:00-05:00",isKnockout:true},
    {id:"k_r32_15",group:"R32",home:"3rd-5",away:"3rd-6",date:"Jul 6",time:"TBD",venue:"TBD",kickoffISO:"2026-07-06T20:00:00-05:00",isKnockout:true},
    {id:"k_r32_16",group:"R32",home:"3rd-7",away:"3rd-8",date:"Jul 6",time:"TBD",venue:"TBD",kickoffISO:"2026-07-06T23:00:00-05:00",isKnockout:true},
  ]},
  {day:5,label:"Round of 16",dates:"Jul 8–10",fixtures:[
    {id:"k_r16_1",group:"R16",home:"W R32-1",away:"W R32-2",date:"Jul 8",time:"TBD",venue:"TBD",kickoffISO:"2026-07-08T20:00:00-05:00",isKnockout:true},
    {id:"k_r16_2",group:"R16",home:"W R32-3",away:"W R32-4",date:"Jul 8",time:"TBD",venue:"TBD",kickoffISO:"2026-07-08T23:00:00-05:00",isKnockout:true},
    {id:"k_r16_3",group:"R16",home:"W R32-5",away:"W R32-6",date:"Jul 9",time:"TBD",venue:"TBD",kickoffISO:"2026-07-09T20:00:00-05:00",isKnockout:true},
    {id:"k_r16_4",group:"R16",home:"W R32-7",away:"W R32-8",date:"Jul 9",time:"TBD",venue:"TBD",kickoffISO:"2026-07-09T23:00:00-05:00",isKnockout:true},
    {id:"k_r16_5",group:"R16",home:"W R32-9",away:"W R32-10",date:"Jul 10",time:"TBD",venue:"TBD",kickoffISO:"2026-07-10T20:00:00-05:00",isKnockout:true},
    {id:"k_r16_6",group:"R16",home:"W R32-11",away:"W R32-12",date:"Jul 10",time:"TBD",venue:"TBD",kickoffISO:"2026-07-10T23:00:00-05:00",isKnockout:true},
    {id:"k_r16_7",group:"R16",home:"W R32-13",away:"W R32-14",date:"Jul 11",time:"TBD",venue:"TBD",kickoffISO:"2026-07-11T20:00:00-05:00",isKnockout:true},
    {id:"k_r16_8",group:"R16",home:"W R32-15",away:"W R32-16",date:"Jul 11",time:"TBD",venue:"TBD",kickoffISO:"2026-07-11T23:00:00-05:00",isKnockout:true},
  ]},
  {day:6,label:"Quarter-Finals",dates:"Jul 12–13",fixtures:[
    {id:"k_qf_1",group:"QF",home:"W R16-1",away:"W R16-2",date:"Jul 12",time:"TBD",venue:"TBD",kickoffISO:"2026-07-12T20:00:00-05:00",isKnockout:true},
    {id:"k_qf_2",group:"QF",home:"W R16-3",away:"W R16-4",date:"Jul 12",time:"TBD",venue:"TBD",kickoffISO:"2026-07-12T23:00:00-05:00",isKnockout:true},
    {id:"k_qf_3",group:"QF",home:"W R16-5",away:"W R16-6",date:"Jul 13",time:"TBD",venue:"TBD",kickoffISO:"2026-07-13T20:00:00-05:00",isKnockout:true},
    {id:"k_qf_4",group:"QF",home:"W R16-7",away:"W R16-8",date:"Jul 13",time:"TBD",venue:"TBD",kickoffISO:"2026-07-13T23:00:00-05:00",isKnockout:true},
  ]},
  {day:7,label:"Semi-Finals",dates:"Jul 15–16",fixtures:[
    {id:"k_sf_1",group:"SF",home:"W QF-1",away:"W QF-2",date:"Jul 15",time:"TBD",venue:"TBD",kickoffISO:"2026-07-15T20:00:00-05:00",isKnockout:true},
    {id:"k_sf_2",group:"SF",home:"W QF-3",away:"W QF-4",date:"Jul 16",time:"TBD",venue:"TBD",kickoffISO:"2026-07-16T20:00:00-05:00",isKnockout:true},
  ]},
  {day:8,label:"3rd Place & Final",dates:"Jul 18–19",fixtures:[
    {id:"k_3rd",group:"3rd Place",home:"L SF-1",away:"L SF-2",date:"Jul 18",time:"TBD",venue:"TBD",kickoffISO:"2026-07-18T20:00:00-05:00",isKnockout:true},
    {id:"k_final",group:"Final",home:"W SF-1",away:"W SF-2",date:"Jul 19",time:"TBD",venue:"MetLife Stadium, New Jersey",kickoffISO:"2026-07-19T20:00:00-05:00",isKnockout:true},
  ]},
];

const PLAYERS = [
  "Achraf Hakimi","Alexander Isak","Alexis Mac Allister","Álvaro Morata","Andrej Kramarić",
  "Antoine Griezmann","Ayoub El Kaabi","Ayoze Pérez","Bradley Barcola","Brian Brobbey",
  "Bruno Fernandes","Bukayo Saka","Callum McGregor","Charles De Ketelaere","Che Adams",
  "Christian Pulisic","Cody Gakpo","Cole Palmer","Cristiano Ronaldo","Darwin Núñez",
  "Désiré Doué","Diogo Jota","Dodi Lukebakio","Dominic Solanke","Donyell Malen",
  "Endrick","Erling Haaland","Facundo Pellistri","Federico Viñas","Ferran Torres",
  "Folarin Balogun","Gabriel Martinelli","Gonçalo Ramos","Haji Wright","Harry Kane",
  "Heung-min Son","Hirving Lozano","Hwang Hee-chan","Igor Thiago","Iliman Ndiaye",
  "Iñaki Williams","Ismaïla Sarr","Ivan Perišić","Jean-Philippe Mateta","Jeremy Doku",
  "Jhon Córdoba","Jordy Caicedo","Jude Bellingham","Julián Álvarez","Julián Quiñones",
  "Kaoru Mitoma","Kingsley Coman","Kylian Mbappé","Lamine Yamal","Lautaro Martínez",
  "Leandro Trossard","Leroy Sané","Lionel Messi","Luis Díaz","Luiz Henrique",
  "Lyndon Dykes","Maghnes Akliouche","Marcus Rashford","Marcus Thuram","Marko Livaja",
  "Martin Ødegaard","Matheus Cunha","Memphis Depay","Michael Olise","Mikel Oyarzabal",
  "Mohamed Kudus","Mohamed Salah","Mostafa Mohamed","Neymar","Nicolas Jackson",
  "Niclas Füllkrug","Nico Williams","Nicolas Paz","Nishan Velupillay","Ollie Watkins",
  "Omar Marmoush","Oscar Bobb","Ousmane Dembélé","Oh Hyeon-gyu","Phil Foden",
  "Rafael Leão","Randal Kolo Muani","Raúl Jiménez","Rayan","Rayan Cherki",
  "Ricardo Pepi","Richarlison","Romelu Lukaku","Sadio Mané","Santiago Giménez",
  "Serge Gnabry","Soufiane Rahimi","Takumi Minamino","Thomas Müller","Vinicius Jr",
  "Wout Weghorst","Florian Wirtz","Jamal Musiala","Patrik Schick","Enner Valencia",
].sort();
const NAV = [{id:"predict",icon:"🎯",label:"Predict"},{id:"standings",icon:"📋",label:"Standings"},{id:"leaderboard",icon:"🏆",label:"Leaderboard"},{id:"bonus",icon:"⭐",label:"Bonus"},{id:"stats",icon:"📊",label:"Stats"}];
const MENU_EXTRA = [{id:"bracket",icon:"🗂️",label:"My Bracket"},{id:"rules",icon:"📖",label:"Rules"}];

function pts(pred,res){if(!pred||!res)return null;const{homeGoals:ph,awayGoals:pa}=pred,{homeGoals:rh,awayGoals:ra}=res;if([ph,pa,rh,ra].some(v=>v==null))return null;if(+ph===+rh&&+pa===+ra)return PTS_EXACT;const po=ph>pa?"H":ph<pa?"A":"D",ro=rh>ra?"H":rh<ra?"A":"D";return po===ro?PTS_RESULT:0;}
function locked(k){return k&&new Date()>=new Date(new Date(k).getTime()-LOCK_MINUTES*60000);}
function lockMsg(k){if(!k)return null;const d=new Date(new Date(k).getTime()-LOCK_MINUTES*60000)-new Date();if(d<=0||d>86400000)return null;const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000);return h>0?`Locks in ${h}h ${m}m`:`Locks in ${m}m`;}
async function apiFetch(p){const r=await fetch(`${API_BASE}${p}`,{headers:{"x-apisports-key":API_KEY}});if(!r.ok)throw new Error(r.status);return r.json();}
function parseFix(data){return data.map(f=>{const s=f.fixture.status.short,isLive=["1H","HT","2H","ET","BT","P","SUSP","INT"].includes(s),isDone=["FT","AET","PEN"].includes(s),dt=new Date(f.fixture.date),rn=parseInt(((f.league.round||"").match(/(\d+)/)||[0,1])[1]);return{id:String(f.fixture.id),rn,group:(f.league.round||"").replace(/Group Stage - /i,"").trim(),home:f.teams.home.name,away:f.teams.away.name,homeLogo:f.teams.home.logo,awayLogo:f.teams.away.logo,date:dt.toLocaleDateString("en-GB",{month:"short",day:"numeric"}),time:dt.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),kickoffISO:f.fixture.date,status:s,elapsed:f.fixture.status.elapsed,venue:f.fixture.venue?.name,isLive,isDone,homeGoals:f.goals.home,awayGoals:f.goals.away};});}
function buildMD(fixtures){const byR={};fixtures.forEach(f=>{const r=f.rn||1;(byR[r]=byR[r]||[]).push(f);});return Object.entries(byR).sort(([a],[b])=>+a-+b).map(([,fxs],i)=>{const s=[...fxs].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));return{day:i+1,label:`Matchday ${i+1}`,dates:s[0]?.date+(s.length>1?` – ${s[s.length-1]?.date}`:""),fixtures:s};});}
function groupTable(gKey,allFix,live,preds){const teams=GROUPS_TEAMS[gKey]||[],t={};teams.forEach(tm=>{t[tm]={team:tm,mp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};});allFix.filter(f=>(f.group||"").toUpperCase().replace(/GROUP\s*/,"").trim()===gKey).forEach(fix=>{const src=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null)||preds[fix.id];if(!src||src.homeGoals==null)return;const hg=+src.homeGoals,ag=+src.awayGoals,h=t[fix.home],a=t[fix.away];if(!h||!a)return;h.mp++;a.mp++;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;if(hg>ag){h.w++;h.pts+=3;a.l++;}else if(hg<ag){a.w++;a.pts+=3;h.l++;}else{h.d++;h.pts++;a.d++;a.pts++;}});return Object.values(t).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);}

function SPill({status,elapsed}){if(["1H","2H","ET"].includes(status))return <span style={{...S.pill,background:"#ef4444",animation:"pulse 1.5s infinite"}}>🔴 {elapsed}'</span>;if(status==="HT")return <span style={{...S.pill,background:"#f59e0b",color:"#000"}}>HT</span>;if(["FT","AET","PEN"].includes(status))return <span style={{...S.pill,background:"#1f2937"}}>FT</span>;return null;}

function PWAPrompt(){const[show,setShow]=useState(false);const[dp,setDp]=useState(null);useEffect(()=>{window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();setDp(e);setTimeout(()=>setShow(true),4000);});},[]);if(!show)return null;return(<div style={S.pwaBar}><span style={{fontSize:20}}>⚽</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>Install Scoracle</div><div style={{fontSize:11,color:"#6b7280"}}>Add to home screen</div></div><button onClick={async()=>{if(dp){await dp.prompt();setShow(false);}}} style={S.pwaBtn}>Install</button><button onClick={()=>setShow(false)} style={S.pwaDismiss}>✕</button></div>);}

function Auth({onLogin}){
  const[mode,setMode]=useState("login");const[name,setName]=useState("");const[email,setEmail]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");const[load,setLoad]=useState(false);
  async function go(){if(mode==="signup"&&!name.trim()){setErr("Please enter your name.");return;}if(!email.includes("@")){setErr("Invalid email.");return;}if(pw.length<6){setErr("Password min 6 characters.");return;}setErr("");setLoad(true);try{if(mode==="signup"){const{data,error:e}=await supabase.auth.signUp({email,password:pw,options:{data:{name:name.trim()}}});if(e)throw e;if(data.user)onLogin({id:data.user.id,name:name.trim(),email});}else{const{data,error:e}=await supabase.auth.signInWithPassword({email,password:pw});if(e)throw e;const{data:pr}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();onLogin({id:data.user.id,name:pr?.name||email.split("@")[0],email});}}catch(e){setErr(e.message||"Something went wrong.");}setLoad(false);}
  return(
    <div style={{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"}}>
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0"/>
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.07"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <g fill="none" stroke="#f59e0b" strokeWidth="1.4" className="pitch-lines">
          {/* Outer boundary */}
          <rect x="20" y="30" width="350" height="784"/>
          {/* Halfway line */}
          <line x1="20" y1="422" x2="370" y2="422"/>
          {/* Centre circle - single, correct position */}
          <circle cx="195" cy="422" r="70"/>
          <circle cx="195" cy="422" r="4" fill="#f59e0b"/>
          {/* Top penalty box */}
          <rect x="95" y="30" width="200" height="110"/>
          {/* Top six yard box */}
          <rect x="140" y="30" width="110" height="48"/>
          {/* Top penalty spot */}
          <circle cx="195" cy="110" r="3" fill="#f59e0b"/>
          {/* Top penalty arc */}
          <path d="M 148 140 A 70 70 0 0 1 242 140"/>
          {/* Bottom penalty box */}
          <rect x="95" y="704" width="200" height="110"/>
          {/* Bottom six yard box */}
          <rect x="140" y="766" width="110" height="48"/>
          {/* Bottom penalty spot */}
          <circle cx="195" cy="734" r="3" fill="#f59e0b"/>
          {/* Bottom penalty arc */}
          <path d="M 148 704 A 70 70 0 0 0 242 704"/>
          {/* Corner arcs */}
          <path d="M 20 50 A 20 20 0 0 1 40 30"/>
          <path d="M 350 30 A 20 20 0 0 1 370 50"/>
          <path d="M 20 794 A 20 20 0 0 0 40 814"/>
          <path d="M 350 814 A 20 20 0 0 0 370 794"/>
        </g>
        <rect className="scan-line" x="0" y="0" width="390" height="80" fill="url(#scanGrad)"/>
      </svg>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.82) 100%)"}}/>
      <div style={{position:"relative",zIndex:1,background:"rgba(8,8,8,0.93)",border:"1px solid #252525",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:400,textAlign:"center"}}>
        <div style={{marginBottom:12}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:10}}>
            <div style={{position:"absolute",inset:-12,background:"radial-gradient(circle,rgba(245,158,11,0.3) 0%,transparent 70%)",borderRadius:"50%"}}/>
            <span style={{fontSize:56,filter:"drop-shadow(0 0 16px rgba(245,158,11,0.6))",display:"block",lineHeight:1}}>⚽</span>
          </div>
          <div style={{fontSize:30,fontWeight:800,letterSpacing:5,color:"#f59e0b",marginBottom:4}}>SCORACLE</div>
          <div style={{fontSize:11,color:"#555",letterSpacing:1,marginBottom:16}}>FIFA World Cup 2026 · Prediction Game</div>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",background:"#111",borderRadius:12,padding:"10px 0",border:"1px solid #1f1f1f",marginBottom:18}}>
            {[["48","TEAMS"],["12","GROUPS"],["104","MATCHES"]].map(([n,l],i)=>(
              <div key={l} style={{display:"flex",alignItems:"center"}}>
                {i>0&&<div style={{width:1,height:28,background:"#222",margin:"0 4px"}}/>}
                <div style={{textAlign:"center",padding:"0 14px"}}><div style={{fontSize:19,fontWeight:800,color:"#f59e0b"}}>{n}</div><div style={{fontSize:9,color:"#555",letterSpacing:1}}>{l}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",background:"#111",borderRadius:12,padding:4,marginBottom:18,gap:4,border:"1px solid #1f1f1f"}}>
          <button onClick={()=>setMode("login")} style={{flex:1,background:mode==="login"?"#1a1a1a":"none",border:"none",color:mode==="login"?"#f59e0b":"#6b7280",padding:"10px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,outline:"none"}}>Sign In</button>
          <button onClick={()=>setMode("signup")} style={{flex:1,background:mode==="signup"?"#1a1a1a":"none",border:"none",color:mode==="signup"?"#f59e0b":"#6b7280",padding:"10px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:600,outline:"none"}}>Create Account</button>
        </div>
        {mode==="signup"&&<div style={{marginBottom:14,textAlign:"left"}}><label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Your Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. John Smith" style={{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/></div>}
        <div style={{marginBottom:14,textAlign:"left"}}><label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Email Address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        <div style={{marginBottom:14,textAlign:"left"}}><label style={{display:"block",fontSize:11,fontWeight:700,color:"#555",letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"}}>Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" style={{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"}} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        {err&&<div style={{fontSize:12,color:"#ef4444",marginBottom:12,padding:"10px 12px",background:"#1f0000",borderRadius:8,border:"1px solid #ef444433"}}>{err}</div>}
        <button onClick={go} disabled={load} style={{width:"100%",background:"linear-gradient(90deg,#f59e0b,#f97316)",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:15,padding:"14px",cursor:"pointer",marginTop:4,opacity:load?0.6:1,outline:"none"}}>{load?"Please wait...":(mode==="login"?"Sign In to Scoracle →":"Join Scoracle →")}</button>
        <div style={{fontSize:10,color:"#333",textAlign:"center",marginTop:14}}>🔒 Predictions Saved · Live Leaderboard</div>
        <div style={{fontSize:11,color:"#f59e0b",textAlign:"center",marginTop:6,fontWeight:600}}>⚽ Competition starts June 11, 2026</div>
      </div>
    </div>
  );
}


export default function App(){
  const[user,setUser]=useState(null);const[authLoad,setAuthLoad]=useState(true);
  const[tab,setTab]=useState("predict");const[menuOpen,setMenuOpen]=useState(false);
  const[matchdays,setMatchdays]=useState([...STATIC_MATCHDAYS,...KNOCKOUT_BRACKET]);const[selDay,setSelDay]=useState(1);
  const[predictions,setPredictions]=useState({});const[live,setLive]=useState({});
  const[bonus,setBonus]=useState({});const[champion,setChampion]=useState(""); // loaded from bonus answers below
  const[savedId,setSavedId]=useState(null);const[confetti,setConfetti]=useState(false);
  const[apiStatus,setApiStatus]=useState("fallback");
  const[allPreds,setAllPreds]=useState([]);const[profiles,setProfiles]=useState([]);const[allBonusAnswers,setAllBonusAnswers]=useState([]);
  const poll=useRef(null);

  useEffect(()=>{supabase.auth.getSession().then(async({data:{session:s}})=>{if(s?.user){const{data:pr}=await supabase.from("profiles").select("*").eq("id",s.user.id).single();setUser({id:s.user.id,name:pr?.name||s.user.email.split("@")[0],email:s.user.email});}setAuthLoad(false);});},[]);
  useEffect(()=>{if(!user)return;supabase.from("predictions").select("*").eq("user_id",user.id).then(({data})=>{if(!data)return;const p={};data.forEach(x=>{p[x.fixture_id]={homeGoals:x.home_goals,awayGoals:x.away_goals};});setPredictions(p);});supabase.from("bonus_answers").select("*").eq("user_id",user.id).then(({data})=>{if(!data)return;const a={};data.forEach(x=>{a[x.question_id]=x.answer;});setBonus(a);const champ=data.find(x=>x.question_id==="champion");if(champ)setChampion(champ.answer);});loadAll();},[user]);
  async function loadAll(){const{data:pr}=await supabase.from("profiles").select("id,name");const{data:ap}=await supabase.from("predictions").select("*");const{data:ab}=await supabase.from("bonus_answers").select("*");setProfiles(pr||[]);setAllPreds(ap||[]);setAllBonusAnswers(ab||[]);}

  const fetchLive=useCallback(async()=>{try{const d=await apiFetch(`/fixtures?league=${LEAGUE_ID}&season=${SEASON}`);if(!d.response?.length){setApiStatus("fallback");return;}const parsed=parseFix(d.response);
    // Split group stage and knockout fixtures
    const groupFix=parsed.filter(f=>f.rn<=3);
    const knockoutFix=parsed.filter(f=>f.rn>3);
    // Build matchdays from group stage
    const mds=buildMD(groupFix);
    // Add knockout rounds - use API data if available, otherwise use static bracket
    if(knockoutFix.length>0){
      const knockoutMDs=buildMD(knockoutFix);
      knockoutMDs.forEach((md,i)=>{md.day=mds.length+i+1;mds.push(md);});
    } else {
      // Merge static knockout bracket
      KNOCKOUT_BRACKET.forEach(kb=>{kb.day=mds.length+(kb.day-3);mds.push(kb);});
    }
    if(mds.length)setMatchdays(mds);
    const nl={};parsed.forEach(f=>{if((f.isLive||f.isDone)&&f.homeGoals!=null)nl[f.id]={homeGoals:f.homeGoals,awayGoals:f.awayGoals,isLive:f.isLive,elapsed:f.elapsed};});setLive(nl);setApiStatus("live");}catch{setApiStatus("fallback");}},[]);
  useEffect(()=>{fetchLive();poll.current=setInterval(fetchLive,30000);return()=>clearInterval(poll.current);},[fetchLive]);

  const allFix=matchdays.flatMap(m=>m.fixtures);
  const totalPts=allFix.reduce((s,fix)=>{const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);return s+(pts(predictions[fix.id],r)||0);},0);
  const predCount=Object.keys(predictions).length;
  const totalFix=allFix.length||48;
  const isAdmin=user?.id===ADMIN_ID;

  async function savePred(id,h,a){const hg=parseInt(h),ag=parseInt(a);if(isNaN(hg)||isNaN(ag))return;setPredictions(p=>({...p,[id]:{homeGoals:hg,awayGoals:ag}}));setSavedId(id);setConfetti(true);setTimeout(()=>setConfetti(false),1400);setTimeout(()=>setSavedId(null),2200);await supabase.from("predictions").upsert({user_id:user.id,fixture_id:id,home_goals:hg,away_goals:ag},{onConflict:"user_id,fixture_id"});loadAll();}
  async function saveBonus(id,val){setBonus(p=>({...p,[id]:val}));await supabase.from("bonus_answers").upsert({user_id:user.id,question_id:id,answer:val},{onConflict:"user_id,question_id"});}
  async function signOut(){await supabase.auth.signOut();setUser(null);setPredictions({});setBonus({});setChampion("");}
  function go(t){setTab(t);setMenuOpen(false);}

  if(authLoad)return(<div style={{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}><span style={{fontSize:48,filter:"drop-shadow(0 0 12px #f59e0b88)"}}>⚽</span><div style={{fontSize:24,fontWeight:800,letterSpacing:4,color:G}}>SCORACLE</div><div style={{fontSize:12,color:"#374151"}}>Loading...</div></div>);
  if(!user)return <Auth onLogin={setUser}/>;

  return(
    <div style={S.root}>
      <style>{CSS}</style>
      {confetti&&<Confetti/>}
      <PWAPrompt/>

      {menuOpen&&(
        <div style={S.overlay} onClick={()=>setMenuOpen(false)}>
          <nav style={S.menu} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"24px 20px 16px"}}>
              <div><div style={{fontSize:18,fontWeight:800,letterSpacing:3,color:G}}>⚽ SCORACLE</div><div style={{fontSize:10,color:"#374151",letterSpacing:1,marginTop:2}}>FIFA World Cup 2026</div></div>
              <button style={{background:"none",border:"1px solid #222",color:"#6b7280",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:14}} onClick={()=>setMenuOpen(false)}>✕</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 20px",background:"#0f0f0f"}}>
              <div style={{fontSize:28}}>👤</div>
              <div><div style={{fontWeight:700,fontSize:14,color:"#f9fafb",display:"flex",alignItems:"center",gap:6}}>{user.name}{isAdmin&&<span style={{fontSize:9,fontWeight:800,color:"#000",background:G,borderRadius:4,padding:"2px 6px"}}>ADMIN</span>}</div><div style={{fontSize:11,color:"#6b7280"}}>{user.email}</div></div>
            </div>
            <div style={{height:1,background:"#141414"}}/>
            {[...NAV,...MENU_EXTRA].map(n=>(<button key={n.id} onClick={()=>go(n.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 20px",background:tab===n.id?"#0d0d0d":"none",border:"none",color:tab===n.id?G:"#6b7280",cursor:"pointer",fontSize:14,fontWeight:500,width:"100%",textAlign:"left",borderLeft:tab===n.id?`3px solid ${G}`:"3px solid transparent"}}><span style={{fontSize:18,width:24,textAlign:"center"}}>{n.icon}</span><span>{n.label}</span>{tab===n.id&&<span style={{marginLeft:"auto",color:G,fontSize:8}}>●</span>}</button>))}
            {isAdmin&&<button onClick={()=>go("admin")} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 20px",background:tab==="admin"?"#0d0d0d":"none",border:"none",borderTop:"1px solid #1a1a1a",color:tab==="admin"?G:"#6b7280",cursor:"pointer",fontSize:14,fontWeight:500,width:"100%",textAlign:"left",borderLeft:tab==="admin"?`3px solid ${G}`:"3px solid transparent"}}><span style={{fontSize:18,width:24,textAlign:"center"}}>⚙️</span><span>Admin Dashboard</span></button>}
            <div style={{height:1,background:"#141414"}}/>
            <div style={{padding:"20px",marginTop:"auto"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{width:8,height:8,borderRadius:"50%",background:apiStatus==="live"?"#22c55e":"#f59e0b",display:"inline-block"}}/><span style={{fontSize:12,color:"#6b7280"}}>{apiStatus==="live"?"Live data connected":"Static data (pre-tournament)"}</span></div>
              <div style={{fontSize:10,color:"#1f2937",marginTop:2}}>48 teams · 12 groups · 104 matches</div>
              <button onClick={signOut} style={{marginTop:16,width:"100%",background:"none",border:"1px solid #1f1f1f",color:"#6b7280",borderRadius:8,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600}}>Sign Out</button>
            </div>
          </nav>
        </div>
      )}

      <header style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <button style={{background:"none",border:"none",cursor:"pointer",padding:"5px 6px",display:"flex",flexDirection:"column",gap:5,flexShrink:0}} onClick={()=>setMenuOpen(true)}>
            {[0,1,2].map(i=><span key={i} style={{display:"block",width:22,height:2,background:G,borderRadius:2}}/>)}
          </button>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:26,filter:`drop-shadow(0 0 8px ${G}66)`}}>⚽</span>
            <div><div style={{fontSize:17,fontWeight:800,letterSpacing:3,color:G}}>SCORACLE</div><div style={{fontSize:9,color:"#374151",letterSpacing:0.5}}>World Cup 2026 · {user.name}</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{background:"#0d0d0d",border:"1px solid #1f1f1f",borderRadius:10,padding:"5px 12px",textAlign:"center"}}><span style={{display:"block",fontSize:16,fontWeight:800,color:G}}>{totalPts}</span><span style={{fontSize:9,color:"#6b7280",letterSpacing:1}}>PTS</span></div>
            <span style={{width:8,height:8,borderRadius:"50%",background:apiStatus==="live"?"#22c55e":"#f59e0b",display:"inline-block",flexShrink:0}}/>
          </div>
        </div>
        <div style={{height:2,background:"#0f0f0f"}}><div style={{height:"100%",background:`linear-gradient(90deg,${G},#22c55e)`,width:`${totalFix?(predCount/totalFix)*100:0}%`,transition:"width 0.6s",borderRadius:2}}/></div>
      </header>

      <nav style={S.botNav}>{NAV.map(n=>(<button key={n.id} onClick={()=>go(n.id)} style={{flex:1,background:"none",border:"none",color:tab===n.id?G:"#374151",padding:"10px 4px 8px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}>{tab===n.id&&<div style={{position:"absolute",top:0,left:"12%",width:"76%",height:2,background:G,borderRadius:"0 0 3px 3px"}}/>}<span style={{fontSize:19}}>{n.icon}</span><span style={{fontSize:9,fontWeight:600,letterSpacing:0.5}}>{n.label}</span></button>))}</nav>

      <main>
        {tab==="predict"&&<PredTab matchdays={matchdays} selDay={selDay} setSelDay={setSelDay} predictions={predictions} live={live} onSave={savePred} savedId={savedId}/>}
        {tab==="standings"&&<StandTab allFix={allFix} live={live} predictions={predictions}/>}
        {tab==="leaderboard"&&<RankTab allFix={allFix} live={live} allPreds={allPreds} profiles={profiles} currentUser={user}/>}
        {tab==="bonus"&&<BonusTab bonus={bonus} onSave={saveBonus} champion={champion} setChampion={c=>{setChampion(c);saveBonus("champion",c);}} teams={ALL_TEAMS}/>}
        {tab==="stats"&&<StatsTab allFix={allFix} predictions={predictions} live={live} totalPts={totalPts} predCount={predCount} totalFix={totalFix}/>}
        {tab==="rules"&&<RulesTab/>}
        {tab==="bracket"&&<BracketTab predictions={predictions} allFix={allFix} live={live}/>}
        {tab==="admin"&&isAdmin&&<AdminTab profiles={profiles} allPreds={allPreds} allBonusAnswers={allBonusAnswers} allFix={allFix} live={live} matchdays={matchdays}/>}
      </main>
    </div>
  );
}

function PredTab({matchdays,selDay,setSelDay,predictions,live,onSave,savedId}){
  const[drafts,setDrafts]=useState({});
  const md=matchdays.find(m=>m.day===selDay)||matchdays[0];
  function val(id,side){const d=drafts[id],pr=predictions[id];if(d?.[side]!==undefined)return d[side];if(side==="home"&&pr?.homeGoals!==undefined)return String(pr.homeGoals);if(side==="away"&&pr?.awayGoals!==undefined)return String(pr.awayGoals);return "";}
  return(<div>
    <div style={{overflowX:"auto",padding:"14px 16px 14px",display:"flex",gap:8,borderBottom:"1px solid #0f0f0f"}}>
      {matchdays.map(m=>(<button key={m.day} onClick={()=>setSelDay(m.day)} style={{background:selDay===m.day?`${G}12`:"#0a0a0a",border:selDay===m.day?`1px solid ${G}`:"1px solid #1a1a1a",color:selDay===m.day?G:"#6b7280",borderRadius:12,padding:"9px 16px",cursor:"pointer",textAlign:"left",flexShrink:0,minWidth:120}}><div style={{fontSize:13,fontWeight:700}}>{m.label}</div><div style={{fontSize:10,marginTop:3,opacity:0.6}}>{m.dates}</div></button>))}
    </div>
    <div style={{padding:16}}>{(md?.fixtures||[]).map(fix=>{
      const lv=live[fix.id],result=lv||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null),pred=predictions[fix.id],p=pts(pred,result),lk=locked(fix.kickoffISO)||fix.isLive||fix.isDone,isSaved=savedId===fix.id,hv=val(fix.id,"home"),av=val(fix.id,"away"),lm=lockMsg(fix.kickoffISO);
      return(<div key={fix.id} style={{...S.card,...(isSaved?{borderColor:"#22c55e",boxShadow:"0 0 18px #22c55e2a"}:{}),...(fix.isLive?{borderColor:"#ef444440",boxShadow:"0 0 18px #ef44441a"}:{})}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8}}>
          <div><span style={{fontSize:10,fontWeight:800,color:fix.isKnockout?"#a855f7":G,letterSpacing:1}}>{fix.isKnockout?fix.group:`Group ${fix.group}`}</span><span style={{fontSize:11,color:"#4b5563"}}> · {fix.date} · {fix.time}</span>{fix.venue&&<div style={{fontSize:10,color:"#374151",marginTop:2}}>📍 {fix.venue}</div>}{lm&&<div style={{fontSize:10,color:"#f59e0b",marginTop:3,fontWeight:600}}>⏱ {lm}</div>}</div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}><SPill status={fix.status} elapsed={fix.elapsed}/>{p!==null&&<span style={{fontSize:11,fontWeight:700,color:"#fff",padding:"3px 8px",borderRadius:20,background:p===PTS_EXACT?"#22c55e":p===PTS_RESULT?"#f59e0b":"#ef4444"}}>{p===PTS_EXACT?`✓ +${PTS_EXACT}`:p===PTS_RESULT?`~ +${PTS_RESULT}`:`✗ +0`}</span>}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>{fix.homeLogo?<img src={fix.homeLogo} alt="" style={{width:32,height:32,objectFit:"contain",borderRadius:4}}/>:<span style={{fontSize:26}}>{FLAGS[fix.home]||"🏳️"}</span>}<span style={{fontSize:12,fontWeight:600,lineHeight:1.3}}>{fix.home}</span></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:110}}>
            {result!=null&&<div style={{textAlign:"center"}}><span style={{fontSize:22,fontWeight:800,color:fix.isLive?"#ef4444":"#f59e0b"}}>{result.homeGoals} – {result.awayGoals}</span><div style={{fontSize:10,color:"#6b7280",fontWeight:700}}>{fix.isLive?`${fix.elapsed}'`:"FT"}</div></div>}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <input type="number" min="0" max="20" value={hv} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],home:e.target.value}}))} style={{width:44,height:44,background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:20,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/>
              <span style={{fontSize:20,fontWeight:700,color:"#374151"}}>:</span>
              <input type="number" min="0" max="20" value={av} onChange={e=>setDrafts(p=>({...p,[fix.id]:{...p[fix.id],away:e.target.value}}))} style={{width:44,height:44,background:"#111",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:20,fontWeight:700,textAlign:"center",outline:"none",WebkitAppearance:"none",opacity:lk?0.35:1,cursor:lk?"not-allowed":"text"}} disabled={lk} placeholder="–"/>
            </div>
            {pred&&!lk&&<div style={{fontSize:10,color:"#374151"}}>Pick: {pred.homeGoals}–{pred.awayGoals}</div>}
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}><span style={{fontSize:12,fontWeight:600,lineHeight:1.3,textAlign:"right"}}>{fix.away}</span>{fix.awayLogo?<img src={fix.awayLogo} alt="" style={{width:32,height:32,objectFit:"contain",borderRadius:4}}/>:<span style={{fontSize:26}}>{FLAGS[fix.away]||"🏳️"}</span>}</div>
        </div>
        {(()=>{
          const hasPred=!!pred;
          const isDirty=hv!==""&&av!==""&&(String(hv)!==String(pred?.homeGoals)||String(av)!==String(pred?.awayGoals));
          const btnBg=lk?"#0f0f0f":isSaved||(!isDirty&&hasPred)?"linear-gradient(90deg,#22c55e,#16a34a)":`linear-gradient(90deg,${G},#f97316)`;
          const btnColor=lk?"#374151":isSaved||(!isDirty&&hasPred)?"#fff":"#000";
          const btnBorder=lk?"1px solid #1a1a1a":"none";
          const btnLabel=lk?(fix.isLive?"🔴 Live — Locked":fix.isDone?"✓ Final Result":"🔒 Locked"):isSaved?"✓ Saved!":!isDirty&&hasPred?"✓ Saved":"Save Pick";
          return(
            <button onClick={()=>onSave(fix.id,hv,av)} disabled={lk||(!isDirty&&hasPred&&!isSaved)}
              style={{width:"100%",background:btnBg,border:btnBorder,borderRadius:10,color:btnColor,fontWeight:800,fontSize:13,padding:"11px",cursor:lk||(!isDirty&&hasPred)?"default":"pointer",letterSpacing:0.5,transition:"all 0.3s",outline:"none"}}>
              {btnLabel}
            </button>
          );
        })()}
      </div>);
    })}</div>
  </div>);
}

function StandTab({allFix,live,predictions}){
  const[g,setG]=useState("A");const rows=groupTable(g,allFix,live,predictions);
  return(<div style={{padding:16}}><div style={S.pageTitle}>Group Standings</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>{GROUPS_LIST.map(x=><button key={x} onClick={()=>setG(x)} style={{background:g===x?`${G}15`:"#0a0a0a",border:g===x?`1px solid ${G}`:"1px solid #1a1a1a",color:g===x?G:"#6b7280",borderRadius:20,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Grp {x}</button>)}</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>{GROUPS_TEAMS[g].map(t=><div key={t} style={{display:"flex",alignItems:"center",gap:5,background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:20,padding:"5px 12px",fontSize:12}}><span>{FLAGS[t]||"🏳️"}</span><span>{t}</span></div>)}</div>
    <div style={{background:"#080808",border:"1px solid #141414",borderRadius:16,overflow:"hidden",marginBottom:10}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:"#0f0f0f"}}><th style={{padding:"10px 8px",fontSize:11,fontWeight:700,color:"#4b5563",textAlign:"left",width:24}}>#</th><th style={{padding:"10px 8px",fontSize:11,fontWeight:700,color:"#4b5563",textAlign:"left"}}>Team</th>{["MP","W","D","L","GD","PTS"].map(h=><th key={h} style={{padding:"10px 8px",fontSize:11,fontWeight:700,color:h==="PTS"?"#f59e0b":"#4b5563",textAlign:"center"}}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=>(<tr key={r.team} style={{borderTop:"1px solid #0f0f0f",...(i<2?{borderLeft:"3px solid #22c55e"}:{})}}>
          <td style={{padding:"12px 8px",fontSize:13,color:i<2?"#22c55e":"#6b7280",fontWeight:800}}>{i+1}</td>
          <td style={{padding:"12px 8px",fontSize:13,textAlign:"left"}}><span style={{marginRight:6}}>{FLAGS[r.team]||"🏳️"}</span><span style={{fontWeight:600,fontSize:13}}>{r.team}</span></td>
          {[r.mp,r.w,r.d,r.l,r.gf-r.ga>0?`+${r.gf-r.ga}`:r.gf-r.ga].map((v,j)=><td key={j} style={{padding:"12px 8px",fontSize:13,textAlign:"center",color:"#d1d5db"}}>{v}</td>)}
          <td style={{padding:"12px 8px",fontSize:16,textAlign:"center",fontWeight:800,color:"#f59e0b"}}>{r.pts}</td>
        </tr>))}</tbody>
      </table>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#6b7280",marginBottom:6}}><span style={{width:10,height:10,background:"#22c55e",borderRadius:2,flexShrink:0,display:"inline-block"}}/>Top 2 qualify · Best 8 third-place teams also advance</div>
    <div style={{fontSize:11,color:"#374151",fontStyle:"italic"}}>Standings reflect live scores + your predictions for unplayed matches.</div>
  </div>);
}

function RankTab({allFix,live,allPreds,profiles,currentUser}){
  const medals=["🥇","🥈","🥉"];
  const[view,setView]=useState("leaderboard"); // leaderboard | breakdown
  const[filter,setFilter]=useState("live"); // live | completed | upcoming

  const userTotals=profiles.map(pr=>{
    const myP=allPreds.filter(p=>p.user_id===pr.id);let tp=0,exact=0,correct=0;
    allFix.forEach(fix=>{const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);if(!r)return;const p=myP.find(x=>x.fixture_id===fix.id);if(!p)return;const sc=pts({homeGoals:p.home_goals,awayGoals:p.away_goals},r);if(sc===PTS_EXACT){tp+=sc;exact++;}else if(sc===PTS_RESULT){tp+=sc;correct++;}});
    return{id:pr.id,name:pr.name,pts:tp,exact,correct,preds:myP};
  }).sort((a,b)=>b.pts-a.pts||b.exact-a.exact||b.correct-a.correct||a.name.localeCompare(b.name));

  // Last 5 form for each user
  const last5Fix=allFix.filter(f=>(f.isLive||f.isDone)&&(live[f.id]!=null||(f.isDone&&f.homeGoals!=null))).slice(-5);
  function getForm(u){
    return last5Fix.map(fix=>{
      const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);
      const pred=u.preds.find(p=>p.fixture_id===fix.id);
      if(!pred)return"n";
      const sc=pts({homeGoals:pred.home_goals,awayGoals:pred.away_goals},r);
      return sc===PTS_EXACT?"p":sc===PTS_RESULT?"r":"w";
    });
  }

  const liveFix=allFix.filter(f=>f.isLive);
  const completedFix=allFix.filter(f=>f.isDone&&!f.isLive);
  const upcomingFix=allFix.filter(f=>!f.isLive&&!f.isDone);

  const filteredFix=filter==="live"?liveFix:filter==="completed"?completedFix:upcomingFix;

  // Auto switch to completed if no live matches
  useState(()=>{if(liveFix.length===0)setFilter("completed");},[]);

  function FormDot({type}){
    const cfg={p:{bg:"rgba(34,197,94,0.2)",border:"rgba(34,197,94,0.5)",c:"#22c55e",l:"P"},r:{bg:"rgba(245,158,11,0.2)",border:"rgba(245,158,11,0.5)",c:"#f59e0b",l:"R"},w:{bg:"rgba(239,68,68,0.15)",border:"rgba(239,68,68,0.4)",c:"#ef4444",l:"W"},n:{bg:"#111",border:"#222",c:"#374151",l:"–"}};
    const s=cfg[type]||cfg.n;
    return<div style={{width:14,height:14,borderRadius:"50%",background:s.bg,border:`1px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:s.c,flexShrink:0}}>{s.l}</div>;
  }

  function MatchCard({fix}){
    const result=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);
    const isUpcoming=!fix.isLive&&!fix.isDone;
    return(
      <div style={{background:"#080808",border:`1px solid ${fix.isLive?"rgba(239,68,68,0.3)":"#141414"}`,borderRadius:16,padding:16,marginBottom:12,boxShadow:fix.isLive?"0 0 16px rgba(239,68,68,0.06)":"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div><span style={{fontSize:10,fontWeight:800,color:fix.isKnockout?"#a855f7":G,letterSpacing:1}}>{fix.isKnockout?fix.group:`Group ${fix.group}`}</span><span style={{fontSize:11,color:"#4b5563"}}> · {fix.date} · {fix.time}</span></div>
          <SPill status={fix.status} elapsed={fix.elapsed}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>{FLAGS[fix.home]||"🏳️"}</span><span style={{fontSize:13,fontWeight:600}}>{fix.home}</span></div>
          <div style={{textAlign:"center",minWidth:80}}>
            {result!=null?<span style={{fontSize:26,fontWeight:800,display:"block",color:fix.isLive?"#ef4444":G}}>{result.homeGoals} – {result.awayGoals}</span>:<span style={{fontSize:16,fontWeight:700,color:"#374151",display:"block"}}>vs</span>}
            {fix.isLive&&<div style={{fontSize:10,color:"#ef4444",fontWeight:700}}>{fix.elapsed}'</div>}
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end"}}><span style={{fontSize:13,fontWeight:600,textAlign:"right"}}>{fix.away}</span><span style={{fontSize:20}}>{FLAGS[fix.away]||"🏳️"}</span></div>
        </div>
        {isUpcoming?(
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:16,background:"#0a0a0a",borderRadius:10,border:"1px dashed #1f1f1f",flexDirection:"column",gap:4}}>
            <span style={{fontSize:20}}>🔒</span>
            <div style={{fontSize:11,color:"#374151",fontWeight:600}}>Predictions hidden until match locks</div>
          </div>
        ):(
          <>
            {/* Stats bar first */}
            {result!=null&&(()=>{
              const ex=userTotals.filter(u=>{const p=u.preds.find(x=>x.fixture_id===fix.id);return p&&pts({homeGoals:p.home_goals,awayGoals:p.away_goals},result)===PTS_EXACT;}).length;
              const res=userTotals.filter(u=>{const p=u.preds.find(x=>x.fixture_id===fix.id);return p&&pts({homeGoals:p.home_goals,awayGoals:p.away_goals},result)===PTS_RESULT;}).length;
              const wrong=userTotals.filter(u=>{const p=u.preds.find(x=>x.fixture_id===fix.id);return p&&pts({homeGoals:p.home_goals,awayGoals:p.away_goals},result)===0;}).length;
              const none=userTotals.filter(u=>!u.preds.find(x=>x.fixture_id===fix.id)).length;
              return(
                <div style={{display:"flex",gap:6,marginBottom:12}}>
                  {[{n:ex,l:"Perfect",c:"#22c55e"},{n:res,l:"Result",c:"#f59e0b"},{n:wrong,l:"Wrong",c:"#ef4444"},{n:none,l:"No pick",c:"#374151"}].map(s=>(
                    <div key={s.l} style={{flex:1,textAlign:"center",background:"#0f0f0f",borderRadius:8,padding:"5px 4px"}}>
                      <div style={{fontSize:14,fontWeight:800,color:s.c}}>{s.n}</div>
                      <div style={{fontSize:9,color:"#6b7280",marginTop:1}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {/* 6-per-row grid */}
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {userTotals.map(u=>{
                const pred=u.preds.find(p=>p.fixture_id===fix.id);
                const sc=pred&&result?pts({homeGoals:pred.home_goals,awayGoals:pred.away_goals},result):null;
                const bg=sc===PTS_EXACT?"rgba(34,197,94,0.1)":sc===PTS_RESULT?"rgba(245,158,11,0.1)":sc===0?"rgba(239,68,68,0.1)":"#111";
                const border=`1px solid ${sc===PTS_EXACT?"rgba(34,197,94,0.3)":sc===PTS_RESULT?"rgba(245,158,11,0.3)":sc===0?"rgba(239,68,68,0.3)":"#1a1a1a"}`;
                const color=sc===PTS_EXACT?"#22c55e":sc===PTS_RESULT?"#f59e0b":sc===0?"#ef4444":"#374151";
                return(
                  <div key={u.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,width:"calc(16.666% - 4px)"}}>
                    <div style={{fontSize:7,color:u.id===currentUser.id?G:"#6b7280",fontWeight:u.id===currentUser.id?800:600,textAlign:"center",width:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name.split(" ")[0]}</div>
                    <div style={{fontSize:9,fontWeight:800,padding:"3px 2px",borderRadius:5,textAlign:"center",width:"100%",background:bg,border,color}}>
                      {pred?`${pred.home_goals}–${pred.away_goals}`:"–"}
                    </div>
                  </div>
                );
              })}
            </div>
            {fix.isLive&&<div style={{fontSize:10,color:"#6b7280",textAlign:"center",marginTop:8}}>⚡ Updates every 30s</div>}
          </>
        )}
      </div>
    );
  }

  return(<div style={{padding:16}}>
    <div style={S.pageTitle}>Leaderboard</div>

    {/* Main tab switcher */}
    <div style={{display:"flex",background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:12,padding:4,gap:4,marginBottom:16}}>
      {[{id:"leaderboard",label:"🏆 Leaderboard"},{id:"breakdown",label:"⚽ Match Breakdown"}].map(t=>(
        <button key={t.id} onClick={()=>setView(t.id)} style={{flex:1,textAlign:"center",padding:"9px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",color:view===t.id?G:"#6b7280",border:"none",background:view===t.id?"#1a1a1a":"none",outline:"none",transition:"all 0.2s"}}>{t.label}</button>
      ))}
    </div>

    {/* ── LEADERBOARD VIEW ── */}
    {view==="leaderboard"&&<>
      {userTotals.length>=1&&(
        <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:6,marginBottom:20,padding:"12px 0"}}>
          {[userTotals[1],userTotals[0],userTotals[2]].filter(Boolean).map((p,i)=>(
            <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
              <div style={{fontSize:22,marginBottom:4}}>👤</div>
              <div style={{fontSize:11,fontWeight:700,textAlign:"center",marginBottom:2,color:"#d1d5db"}}>{p.name}</div>
              <div style={{fontSize:14,fontWeight:800,color:G,marginBottom:6}}>{p.pts}<span style={{fontSize:10,color:"#6b7280"}}> pts</span></div>
              <div style={{width:"100%",height:["82px","104px","68px"][i],background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:"8px 8px 0 0",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:20}}>{medals[[1,0,2][i]]}</span></div>
            </div>
          ))}
        </div>
      )}

      {/* Form guide legend */}
      {last5Fix.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"7px 12px",background:"#080808",border:"1px solid #141414",borderRadius:10,flexWrap:"wrap"}}>
          <div style={{fontSize:10,color:"#6b7280",fontWeight:700}}>Last 5:</div>
          {[{t:"p",l:"Perfect",c:"#22c55e"},{t:"r",l:"Result",c:"#f59e0b"},{t:"w",l:"Wrong",c:"#ef4444"},{t:"n",l:"No pick",c:"#374151"}].map(({t,l,c})=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:3}}><FormDot type={t}/><span style={{fontSize:10,color:"#6b7280"}}>{l}</span></div>
          ))}
        </div>
      )}

      {/* Leaderboard rows */}
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:28}}>
        {userTotals.map((p,i)=>{
          const form=getForm(p);
          return(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,background:p.id===currentUser.id?`${G}0a`:"#080808",border:p.id===currentUser.id?`1px solid ${G}`:"1px solid #141414",borderRadius:12,padding:"10px 14px"}}>
              <div style={{fontSize:14,width:26,textAlign:"center",fontWeight:700,color:i>=3?"#6b7280":"inherit"}}>{i<3?medals[i]:`#${i+1}`}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13}}>{p.name}{p.id===currentUser.id&&" (You)"}</div>
                <div style={{fontSize:10,color:"#6b7280",marginTop:1}}>{p.exact} perfect · {p.correct} result</div>
                {form.length>0&&<div style={{display:"flex",gap:3,marginTop:4}}>{form.map((f,fi)=><FormDot key={fi} type={f}/>)}</div>}
              </div>
              <div style={{fontSize:18,fontWeight:800,color:G,flexShrink:0}}>{p.pts}<span style={{fontSize:10,color:"#6b7280"}}> pts</span></div>
            </div>
          );
        })}
        {userTotals.length===0&&<div style={{textAlign:"center",color:"#374151",padding:40,fontSize:14}}>No results yet — check back after June 11! ⚽</div>}
      </div>
    </>}

    {/* ── MATCH BREAKDOWN VIEW ── */}
    {view==="breakdown"&&<>
      {/* Filter pills */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {[
          {id:"live",label:`🔴 Live`,count:liveFix.length,onColor:"#ef4444",onBg:"#ef4444"},
          {id:"completed",label:`✅ Completed`,count:completedFix.length,onColor:"#fff",onBg:"#1f2937"},
          {id:"upcoming",label:`🕐 Upcoming`,count:upcomingFix.length,onColor:G,onBg:`${G}18`},
        ].map(p=>(
          <button key={p.id} onClick={()=>setFilter(p.id)}
            style={{padding:"7px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",border:filter===p.id?"none":`1px solid #1f1f1f`,background:filter===p.id?p.onBg:"#0f0f0f",color:filter===p.id?p.onColor:"#6b7280",outline:"none",transition:"all 0.2s"}}>
            {p.label} <span style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"1px 6px",fontSize:10,marginLeft:2}}>{p.count}</span>
          </button>
        ))}
      </div>

      <div style={{fontSize:12,color:"#6b7280",marginBottom:14}}>🟢 perfect · 🟡 result · 🔴 wrong{filter==="live"?" · Based on current score":""}</div>

      {filteredFix.length===0&&(
        <div style={{background:"#080808",border:"1px solid #141414",borderRadius:16,padding:32,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>{filter==="live"?"🔴":filter==="completed"?"✅":"🕐"}</div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{filter==="live"?"No live matches right now":filter==="completed"?"No completed matches yet":"No upcoming matches"}</div>
        </div>
      )}

      {filteredFix.map(fix=><MatchCard key={fix.id} fix={fix}/>)}
    </>}
  </div>);
}


function StatsTab({allFix,predictions,live,totalPts,predCount,totalFix}){
  const rm=allFix.reduce((a,fix)=>{const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);if(r)a[fix.id]=r;return a;},{});
  const played=Object.keys(rm).length,exact=Object.keys(predictions).filter(id=>pts(predictions[id],rm[id])===PTS_EXACT).length,correct=Object.keys(predictions).filter(id=>(pts(predictions[id],rm[id])||0)>=PTS_RESULT).length,acc=predCount>0?Math.round((exact/Math.min(predCount,played||1))*100):0;
  return(<div style={{padding:16}}><div style={S.pageTitle}>My Stats</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[{label:"Total Points",value:totalPts,icon:"🏅",color:"#f59e0b"},{label:"Perfect Scores",value:exact,icon:"🎯",color:"#22c55e"},{label:"Correct Results",value:correct,icon:"✅",color:"#3b82f6"},{label:"Accuracy",value:`${acc}%`,icon:"📈",color:"#a855f7"},{label:"Picks Made",value:`${predCount}/${totalFix}`,icon:"✍️",color:"#ec4899"},{label:"Avg / Match",value:played>0?(totalPts/played).toFixed(1):"0.0",icon:"⚡",color:"#06b6d4"}].map(c=>(<div key={c.label} style={{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:16,textAlign:"center"}}><div style={{width:36,height:36,borderRadius:10,background:c.color+"22",color:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,margin:"0 auto 10px"}}>{c.icon}</div><div style={{fontSize:26,fontWeight:800,marginBottom:4}}>{c.value}</div><div style={{fontSize:11,color:"#6b7280"}}>{c.label}</div></div>))}</div></div>);
}

function RulesTab(){
  return(<div style={{padding:16}}>
    <div style={S.pageTitle}>📖 How to Play</div>
    <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",borderRadius:14,padding:16,fontSize:13,color:"#9ca3af",lineHeight:1.7,marginBottom:20}}>Welcome to <strong style={{color:G}}>Scoracle</strong> — the official prediction game for FIFA World Cup 2026. Predict scores, rack up points, and climb the leaderboard!</div>
    {[{title:"🎯 How Predictions Work",body:["Predict the final score for every match.","Predictions lock 15 minutes before kick-off.","For knockouts going to penalties, enter the total score including all goals."]},{title:"🔒 Deadlines",body:["Match predictions lock 15 minutes before each kick-off.","All bonus questions must be submitted before June 11, 2026."]}].map(s=>(<div key={s.title}><div style={{fontSize:14,fontWeight:800,color:G,letterSpacing:1,marginTop:24,marginBottom:12,textTransform:"uppercase"}}>{s.title}</div><div style={{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:16,marginBottom:12}}>{s.body.map((b,i)=><p key={i} style={{fontSize:13,color:"#9ca3af",lineHeight:1.7,marginBottom:8}}>{b}</p>)}</div></div>))}
    <div style={{fontSize:14,fontWeight:800,color:G,letterSpacing:1,marginTop:24,marginBottom:12,textTransform:"uppercase"}}>⚡ Scoring System</div>
    <div style={{background:"#080808",border:`1px solid ${G}22`,borderRadius:14,padding:16,marginBottom:12}}>
      <div style={{fontSize:12,fontWeight:700,color:"#6b7280",marginBottom:12}}>Example: Mexico vs South Africa — Final score <span style={{color:G}}>2–1</span></div>
      {[{pred:"2 – 1",p:15,label:"Exact score + correct result",color:"#22c55e"},{pred:"1 – 0",p:5,label:"Correct result, wrong score",color:"#f59e0b"},{pred:"1 – 2",p:0,label:"Wrong result",color:"#ef4444"},{pred:"1 – 1",p:0,label:"Wrong result (draw predicted)",color:"#ef4444"}].map(e=>(<div key={e.pred} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #111"}}><div style={{fontSize:18,fontWeight:800,color:"#f9fafb",width:60,textAlign:"center",flexShrink:0}}>{e.pred}</div><div style={{flex:1,fontSize:13,fontWeight:600,color:e.color}}>{e.label}</div><div style={{fontSize:20,fontWeight:800,color:e.color,flexShrink:0,width:36,textAlign:"right"}}>+{e.p}</div></div>))}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {[{pts:50,label:"Tournament Winner",desc:"Correctly predict the World Cup champion",color:"#f59e0b"},{pts:10,label:"Advancement Picks",desc:"Each team correctly picked per round (R32, R16, QF, SF, Final)",color:"#a855f7"},{pts:10,label:"Golden Boot",desc:"Correctly predict the tournament top scorer",color:"#22c55e"},{pts:10,label:"Most Group Stage Goals",desc:"Which team scores the most goals in the group stage",color:"#06b6d4"}].map(r=>(<div key={r.label} style={{display:"flex",alignItems:"flex-start",gap:14,background:"#080808",border:"1px solid #141414",borderRadius:12,padding:16}}><div style={{fontSize:22,fontWeight:800,color:r.color,width:40,flexShrink:0,textAlign:"center"}}>+{r.pts}</div><div><div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{r.label}</div><div style={{fontSize:12,color:"#6b7280"}}>{r.desc}</div></div></div>))}
    </div>
    <div style={{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:16,marginTop:16,textAlign:"center",fontSize:16}}>Good luck everyone! ⚽🏆</div>
  </div>);
}

function AdminTab({profiles,allPreds,allBonusAnswers,allFix,live,matchdays}){
  const[view,setView]=useState("overview");const totalFix=allFix.length,totalUsers=profiles.length,totalPreds=allPreds.length;
  const stats=profiles.map(p=>{const my=allPreds.filter(x=>x.user_id===p.id);let tp=0,exact=0;allFix.forEach(fix=>{const r=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);if(!r)return;const pred=my.find(x=>x.fixture_id===fix.id);if(!pred)return;const sc=pts({homeGoals:pred.home_goals,awayGoals:pred.away_goals},r);if(sc)tp+=sc;if(sc===PTS_EXACT)exact++;});return{...p,predCount:my.length,pts:tp,exact,missing:totalFix-my.length};}).sort((a,b)=>b.pts-a.pts||b.exact-a.exact||b.correct-a.correct||a.name.localeCompare(b.name));
  return(<div style={{padding:16}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><div style={S.pageTitle}>⚙️ Admin Dashboard</div><span style={{fontSize:9,fontWeight:800,color:"#000",background:G,borderRadius:4,padding:"2px 6px"}}>ADMIN</span></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:24}}>{[{label:"Players",value:totalUsers,icon:"👥",color:"#3b82f6"},{label:"Predictions",value:totalPreds,icon:"✍️",color:"#22c55e"},{label:"Avg Picks",value:totalUsers>0?(totalPreds/totalUsers).toFixed(1):0,icon:"📊",color:"#f59e0b"}].map(c=>(<div key={c.label} style={{background:"#080808",border:"1px solid #141414",borderRadius:14,padding:12,textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>{c.icon}</div><div style={{fontSize:22,fontWeight:800,color:c.color}}>{c.value}</div><div style={{fontSize:10,color:"#6b7280"}}>{c.label}</div></div>))}</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{[{id:"overview",label:"👥 Players"},{id:"missing",label:"⚠️ Missing"},{id:"matches",label:"⚽ Matches"},{id:"bonus",label:"⭐ Bonus"}].map(t=><button key={t.id} onClick={()=>setView(t.id)} style={{background:view===t.id?`${G}15`:"#0a0a0a",border:view===t.id?`1px solid ${G}`:"1px solid #1a1a1a",color:view===t.id?G:"#6b7280",borderRadius:20,padding:"6px 14px",fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.label}</button>)}</div>
    {view==="overview"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>{stats.map((u,i)=>(<div key={u.id} style={{display:"flex",alignItems:"center",gap:12,background:"#080808",border:"1px solid #141414",borderRadius:12,padding:"12px 14px"}}><div style={{fontWeight:700,fontSize:13,color:"#6b7280",width:24}}>#{i+1}</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{u.name}</div><div style={{fontSize:11,color:"#6b7280"}}>{u.predCount}/{totalFix} picks · {u.exact} perfect</div></div><div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:800,color:G}}>{u.pts}<span style={{fontSize:11,color:"#6b7280"}}> pts</span></div>{u.missing>0&&<div style={{fontSize:10,color:"#ef4444"}}>{u.missing} missing</div>}</div></div>))}</div>}
    {view==="missing"&&<div>
      {stats.filter(u=>u.missing>0).length===0
        ?<div style={{textAlign:"center",color:"#22c55e",padding:32,fontWeight:600}}>🎉 Everyone has submitted all picks!</div>
        :stats.filter(u=>u.missing>0).map(u=>{
          const submittedIds=allPreds.filter(p=>p.user_id===u.id).map(p=>p.fixture_id);
          const missingFixes=allFix.filter(f=>!submittedIds.includes(f.id));
          return(<div key={u.id} style={{background:"#080808",border:"1px solid #141414",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:missingFixes.length>0?10:0}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{u.name}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>{u.predCount}/{totalFix} submitted</div>
              </div>
              <div style={{background:"#1f0000",border:"1px solid #ef444433",color:"#ef4444",fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:20}}>{u.missing} missing</div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {missingFixes.map(f=>(
                <div key={f.id} style={{fontSize:10,fontWeight:600,background:"#111",border:"1px solid #1f1f1f",borderRadius:6,padding:"3px 8px",color:"#6b7280"}}>
                  {f.home} vs {f.away} · {f.date}
                </div>
              ))}
            </div>
          </div>);
        })
      }
    </div>}
    {view==="matches"&&<div>{matchdays.map(md=>(<div key={md.day}><div style={{fontSize:13,fontWeight:800,color:"#6b7280",letterSpacing:1,marginBottom:8,marginTop:16}}>{md.label.toUpperCase()}</div>{md.fixtures.map(fix=>{
      const result=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null);
      const predsForMatch=allPreds.filter(p=>p.fixture_id===fix.id);
      const missingUsers=profiles.filter(p=>!predsForMatch.find(x=>x.user_id===p.id));
      const lockTime=new Date(new Date(fix.kickoffISO).getTime()-60*60000);
      const lockStr=lockTime.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
      function copyReminder(){
        const msg=`⚽ Scoracle reminder — ${fix.home} vs ${fix.away} kicks off at ${fix.time} on ${fix.date}! Get your prediction in before ${lockStr} when it locks. scoracle.live`;
        navigator.clipboard.writeText(msg);
      }
      function copyMissing(){
        if(missingUsers.length===0){navigator.clipboard.writeText("Everyone has submitted their prediction for this match! ✅");return;}
        const names=missingUsers.map(u=>u.name).join(", ");
        const msg=`⚽ Still waiting on: ${names} — get your ${fix.home} vs ${fix.away} prediction in before ${lockStr}! scoracle.live`;
        navigator.clipboard.writeText(msg);
      }
      return(<div key={fix.id} style={{background:"#080808",border:"1px solid #141414",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700}}>{fix.home} vs {fix.away}</div>
            <div style={{fontSize:11,color:"#6b7280"}}>{fix.date} · {fix.time} · Group {fix.group}</div>
            <div style={{fontSize:11,color:"#6b7280"}}>{predsForMatch.length}/{totalUsers} predictions · {missingUsers.length} missing</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            {result!=null?<div style={{fontSize:16,fontWeight:800,color:G}}>{result.homeGoals}–{result.awayGoals}</div>:<div style={{fontSize:11,color:"#374151"}}>No result yet</div>}
            <SPill status={fix.status} elapsed={fix.elapsed}/>
          </div>
        </div>
        {missingUsers.length>0&&(
          <div style={{marginTop:10,padding:"8px 10px",background:"#0f0f0f",borderRadius:8,border:"1px solid #1f1f1f"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#ef4444",marginBottom:4}}>Missing: {missingUsers.map(u=>u.name).join(", ")}</div>
          </div>
        )}
        <div style={{display:"flex",gap:6,marginTop:10}}>
          <button onClick={copyReminder} style={{flex:1,background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:8,color:"#f59e0b",fontSize:11,fontWeight:700,padding:"8px",cursor:"pointer"}}>📋 Copy Reminder</button>
          <button onClick={copyMissing} style={{flex:1,background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:8,color:"#6b7280",fontSize:11,fontWeight:700,padding:"8px",cursor:"pointer"}}>👥 Copy Missing</button>
        </div>
      </div>);})}</div>))}</div>}
    {view==="bonus"&&<div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:12}}>Everyone's bonus question picks · Sorted alphabetically</div>
      {/* Copy buttons */}
      {(()=>{
        const BONUS_KEYS=["champion","topscorer","mostgoals","adv_r32","adv_r16","adv_qf","adv_sf","adv_final"];
        const sorted=[...profiles].sort((a,b)=>a.name.localeCompare(b.name));
        function getStatus(p){
          const ub=allBonusAnswers.filter(b=>b.user_id===p.id);
          const done=BONUS_KEYS.filter(k=>ub.find(b=>b.question_id===k)).length;
          return{done,total:BONUS_KEYS.length,complete:done===BONUS_KEYS.length,partial:done>0&&done<BONUS_KEYS.length,none:done===0};
        }
        function copyMessage(){
          const complete=sorted.filter(p=>getStatus(p).complete).map(p=>p.name);
          const partial=sorted.filter(p=>getStatus(p).partial).map(p=>{const s=getStatus(p);return`${p.name} (${s.done}/8)`;});
          const none=sorted.filter(p=>getStatus(p).none).map(p=>p.name);
          let msg="⚽ *Scoracle — Bonus Questions Status*
🔒 Deadline: Midnight, June 11

";
          if(complete.length)msg+=`✅ *Complete (${complete.length})*
${complete.map(n=>`• ${n}`).join("
")}

`;
          if(partial.length)msg+=`⚠️ *Partial (${partial.length})*
${partial.map(n=>`• ${n}`).join("
")}

`;
          if(none.length)msg+=`❌ *Not started (${none.length})*
${none.map(n=>`• ${n}`).join("
")}

`;
          msg+="Get your picks in before midnight! 👉 scoracle.live";
          navigator.clipboard.writeText(msg);
        }
        function copyReminder(){
          const incomplete=sorted.filter(p=>!getStatus(p).complete).map(p=>p.name);
          const msg=`⚽ Scoracle reminder — bonus questions close at midnight June 11! Still waiting on: ${incomplete.join(", ")} to complete theirs. Get them in at scoracle.live 🏆`;
          navigator.clipboard.writeText(msg);
        }
        return(
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <button onClick={copyReminder} style={{flex:1,background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:G,fontSize:11,fontWeight:700,padding:"10px",cursor:"pointer",outline:"none"}}>📋 Copy Group Reminder</button>
              <button onClick={copyMessage} style={{flex:1,background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#6b7280",fontSize:11,fontWeight:700,padding:"10px",cursor:"pointer",outline:"none"}}>📋 Copy Full Status</button>
            </div>
          </div>
        );
      })()}
      {profiles.map(p=>{
        const ub=allBonusAnswers.filter(b=>b.user_id===p.id);
        const get=id=>ub.find(b=>b.question_id===id)?.answer;
        const champ=get("champion"),topscorer=get("topscorer"),mostgoals=get("mostgoals");
        const r32=get("adv_r32"),r16=get("adv_r16"),qf=get("adv_qf"),sf=get("adv_sf"),fin=get("adv_final");
        const rows=[
          {l:"🏆 Champion",v:champ},
          {l:"⚽ Top Scorer",v:topscorer},
          {l:"📊 Most Group Goals",v:mostgoals},
          {l:"R32 picks",v:r32?`${JSON.parse(r32).length}/32`:null},
          {l:"R16 picks",v:r16?`${JSON.parse(r16).length}/16`:null},
          {l:"QF picks",v:qf?`${JSON.parse(qf).length}/8`:null},
          {l:"SF picks",v:sf?`${JSON.parse(sf).length}/4`:null},
          {l:"Final picks",v:fin?`${JSON.parse(fin).length}/2`:null},
        ];
        const answered=rows.filter(r=>r.v).length;
        return(<div key={p.id} style={{background:"#080808",border:"1px solid #141414",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontWeight:700,fontSize:14}}>{p.name}</div>
            <div style={{fontSize:10,color:answered===rows.length?"#22c55e":answered>0?"#f59e0b":"#ef4444",fontWeight:700}}>{answered}/{rows.length} done</div>
          </div>
          {rows.map(({l,v})=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
              <span style={{color:"#6b7280"}}>{l}</span>
              <span style={{color:v?"#f9fafb":"#374151",fontWeight:v?600:400}}>{v||"Not picked"}</span>
            </div>
          ))}
        </div>);
      })}
    </div>}
  </div>);
}

function Confetti(){const cols=["#f59e0b","#22c55e","#3b82f6","#ef4444","#a855f7","#fff","#06b6d4"];return(<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>{Array.from({length:22},(_,i)=>(<div key={i} className="cp" style={{position:"absolute",top:-10,borderRadius:2,left:`${Math.random()*100}%`,width:`${5+Math.random()*7}px`,height:`${5+Math.random()*7}px`,background:cols[i%cols.length],animationDelay:`${Math.random()*0.5}s`}}/>))}</div>);}

const S={
  root:{minHeight:"100vh",background:"#000",color:"#f9fafb",fontFamily:"'DM Sans','Segoe UI',sans-serif",maxWidth:960,margin:"0 auto",paddingBottom:72},
  authWrap:{minHeight:"100vh",background:"#000",display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"},
  authBg:{position:"absolute",inset:0,background:"linear-gradient(135deg,#0a0a0a 0%,#0d0800 50%,#000 100%)"},
  authCard:{background:"rgba(10,10,10,0.96)",border:"1px solid #1f1f1f",borderRadius:24,padding:32,width:"100%",maxWidth:440,position:"relative",zIndex:1,backdropFilter:"blur(20px)"},
  pwaBar:{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:500,background:"#0f0f0f",border:`1px solid ${G}44`,borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,zIndex:300,boxShadow:`0 4px 20px ${G}22`},
  pwaBtn:{background:`linear-gradient(90deg,${G},#f97316)`,border:"none",borderRadius:8,color:"#000",fontWeight:800,fontSize:13,padding:"8px 16px",cursor:"pointer",flexShrink:0},
  pwaDismiss:{background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:16,padding:"4px 8px",flexShrink:0},
  header:{background:"#000",borderBottom:"1px solid #141414",padding:"14px 16px 0",position:"sticky",top:0,zIndex:100},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:500,backdropFilter:"blur(6px)"},
  menu:{position:"fixed",top:0,left:0,bottom:0,width:290,background:"#080808",borderRight:"1px solid #1a1a1a",display:"flex",flexDirection:"column",zIndex:501,overflowY:"auto"},
  botNav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:960,background:"#040404",borderTop:"1px solid #141414",display:"flex",zIndex:200},
  card:{background:"#080808",border:"1px solid #141414",borderRadius:16,padding:16,marginBottom:12,transition:"border-color 0.3s,box-shadow 0.3s"},
  pill:{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,color:"#fff"},
  pageTitle:{fontSize:20,fontWeight:800,marginBottom:16,letterSpacing:0.3},
  lbl:{display:"block",fontSize:11,fontWeight:700,color:"#6b7280",letterSpacing:0.5,marginBottom:6,textTransform:"uppercase"},
  inp:{width:"100%",background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:10,color:"#f9fafb",fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"},
};

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
@keyframes pp{0%,100%{opacity:0.14}50%{opacity:0.24}}
@keyframes sc{0%{transform:translateY(-100%)}100%{transform:translateY(2000%)}}
@keyframes ballFloat{0%,100%{transform:translateY(0px)}50%{transform:translateY(-5px)}}
@keyframes glowP{0%,100%{opacity:0.25}50%{opacity:0.55}}
.pp{animation:pp 3s ease-in-out infinite}
.scanline{animation:sc 5s linear infinite}
.ballf{animation:ballFloat 3s ease-in-out infinite}
.glowp{animation:glowP 3s ease-in-out infinite}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#000;-webkit-tap-highlight-color:transparent;}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
input[type=number]{-moz-appearance:textfield;}
input,select,button,textarea{outline:none!important;} input:focus,select:focus{border-color:#1a1a1a!important;box-shadow:none!important;}
button:active{transform:scale(0.97);}
tr:hover td{background:#0c0c0c;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
@keyframes pitchPulse{0%,100%{opacity:0.13;}50%{opacity:0.22;}}
::-webkit-scrollbar{height:4px;width:4px;background:#0a0a0a;}
::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:#3a3a3a;}
::-webkit-scrollbar-track{background:#0a0a0a;}
*{scrollbar-width:thin;scrollbar-color:#2a2a2a #0a0a0a;}
@keyframes scanMove{0%{transform:translateY(-100px);}100%{transform:translateY(1000px);}}
.pitch-lines{animation:pitchPulse 3s ease-in-out infinite;}
.scan-line{animation:scanMove 5s linear infinite;}
.cp{animation:fall 1.4s ease-in forwards;}
@keyframes fall{0%{transform:translateY(0) rotate(0);opacity:1;}100%{transform:translateY(100vh) rotate(720deg);opacity:0;}}
`;

// ══════════════════ BRACKET TAB ═══════════════════════════════════════
const R32_BRACKET = [
  {id:"m74",label:"Group E winner vs Best 3rd (A/B/C/D/F)",homeKey:"W_E",awayKey:"3rd_ABCDF"},
  {id:"m75",label:"Group F winner vs Runner-up Group C",homeKey:"W_F",awayKey:"RU_C"},
  {id:"m76",label:"Group C winner vs Runner-up Group F",homeKey:"W_C",awayKey:"RU_F"},
  {id:"m77",label:"Group I winner vs Best 3rd (C/D/F/G/H)",homeKey:"W_I",awayKey:"3rd_CDFGH"},
  {id:"m78",label:"Runner-up Group E vs Runner-up Group I",homeKey:"RU_E",awayKey:"RU_I"},
  {id:"m79",label:"Group A winner vs Best 3rd (C/E/F/H/I)",homeKey:"W_A",awayKey:"3rd_CEFHI"},
  {id:"m80",label:"Group L winner vs Best 3rd (E/H/I/J/K)",homeKey:"W_L",awayKey:"3rd_EHIJK"},
  {id:"m81",label:"Group D winner vs Best 3rd (B/E/F/I/J)",homeKey:"W_D",awayKey:"3rd_BEFIJ"},
  {id:"m82",label:"Group G winner vs Best 3rd (A/E/H/I/J)",homeKey:"W_G",awayKey:"3rd_AEHIJ"},
  {id:"m83",label:"Runner-up Group K vs Runner-up Group L",homeKey:"RU_K",awayKey:"RU_L"},
  {id:"m84",label:"Group H winner vs Runner-up Group J",homeKey:"W_H",awayKey:"RU_J"},
  {id:"m85",label:"Group B winner vs Best 3rd (E/F/G/I/J)",homeKey:"W_B",awayKey:"3rd_EFGIJ"},
  {id:"m86",label:"Group J winner vs Runner-up Group H",homeKey:"W_J",awayKey:"RU_H"},
  {id:"m87",label:"Runner-up Group G vs Best 3rd (A/B/C/D/F)",homeKey:"RU_G",awayKey:"3rd_ABCDF2"},
  {id:"m88",label:"Group K winner vs Runner-up Group D",homeKey:"W_K",awayKey:"RU_D"},
  {id:"m89",label:"Runner-up Group B vs Runner-up Group A",homeKey:"RU_B",awayKey:"RU_A"},
];

function calcBracketStandings(predictions,allFix,live){
  const standings={};
  Object.keys(GROUPS_TEAMS).forEach(g=>{
    const teams=GROUPS_TEAMS[g],table={};
    teams.forEach(t=>{table[t]={team:t,mp:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};});
    allFix.filter(f=>(f.group||'').toUpperCase().replace(/GROUP\s*/,'').trim()===g&&!f.isKnockout).forEach(fix=>{
      const src=live[fix.id]||(fix.isDone?{homeGoals:fix.homeGoals,awayGoals:fix.awayGoals}:null)||predictions[fix.id];
      if(!src||src.homeGoals==null)return;
      const hg=+src.homeGoals,ag=+src.awayGoals,h=table[fix.home],a=table[fix.away];
      if(!h||!a)return;
      h.mp++;a.mp++;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;
      if(hg>ag){h.w++;h.pts+=3;a.l++;}else if(hg<ag){a.w++;a.pts+=3;h.l++;}else{h.d++;h.pts++;a.d++;a.pts++;}
    });
    standings[g]=Object.values(table).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
  });
  return standings;
}

function getBest3rd(standings){
  return Object.entries(standings).map(([g,rows])=>({group:g,...rows[2]})).filter(t=>t.team).sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);
}

function resolveSlot(key,standings){
  if(key.startsWith('W_'))return standings[key.slice(2)]?.[0]?.team||`Winner Group ${key.slice(2)}`;
  if(key.startsWith('RU_'))return standings[key.slice(3)]?.[1]?.team||`Runner-up Group ${key.slice(3)}`;
  return key;
}

function assignBest3rd(r32Bracket, standings, allThirds){
  const best8 = allThirds.slice(0,8);
  const used = new Set();
  // Sort slots by how restrictive they are (fewer eligible groups = assign first)
  const slotsWithIdx = r32Bracket
    .map((m,i) => ({m, i}))
    .filter(({m}) => m.awayKey && m.awayKey.startsWith('3rd_'));
  slotsWithIdx.sort((a,b) => {
    const la = a.m.awayKey.replace('3rd_','').replace(/[0-9]/g,'').length;
    const lb = b.m.awayKey.replace('3rd_','').replace(/[0-9]/g,'').length;
    return la - lb; // assign most restrictive slots first
  });
  const result = [...r32Bracket];
  slotsWithIdx.forEach(({m, i}) => {
    const suffix = m.awayKey.replace('3rd_','').replace(/[0-9]/g,'');
    const eligibleGroups = suffix.split('');
    const pick = best8.find(t => eligibleGroups.includes(t.group) && !used.has(t.team));
    if(pick) used.add(pick.team);
    result[i] = {...result[i], away: pick?.team || `Best 3rd (${suffix})`};
  });
  return result;
}

function BracketTab({predictions,allFix,live}){
  const standings=calcBracketStandings(predictions,allFix,live);
  const allThirds=getBest3rd(standings);
  const best3rd=allThirds.slice(0,8);

  // Build initial R32 from group predictions
  const resolvedBracket = assignBest3rd(
    R32_BRACKET.map(m=>({...m, home:resolveSlot(m.homeKey,standings), away:resolveSlot(m.awayKey,standings)})),
    standings, allThirds
  );
  const initR32=resolvedBracket.map(m=>({
    id:m.id,label:m.label,
    home:m.home,
    away:m.away,
    winner:null,
  }));

  const [r32,setR32]=useState(initR32);
  const [r16,setR16]=useState(Array(8).fill(null).map((_,i)=>({home:'TBD',away:'TBD',winner:null})));
  const [qf,setQf]=useState(Array(4).fill(null).map((_,i)=>({home:'TBD',away:'TBD',winner:null})));
  const [sf,setSf]=useState(Array(2).fill(null).map((_,i)=>({home:'TBD',away:'TBD',winner:null})));
  const [final,setFinal]=useState({home:'TBD',away:'TBD',winner:null});
  const [resetKey,setResetKey]=useState(0);

  function advanceR32(matchIdx,winner){
    const newR32=[...r32];newR32[matchIdx]={...newR32[matchIdx],winner};
    setR32(newR32);
    // Build R16 from R32 winners - pairs: (0,1),(2,3),(4,5),(6,7),(8,9),(10,11),(12,13),(14,15)
    const newR16=[...r16];
    const pairIdx=Math.floor(matchIdx/2);
    const slot=matchIdx%2===0?'home':'away';
    newR16[pairIdx]={...newR16[pairIdx],[slot]:winner,winner:null};
    setR16(newR16);
    // Clear downstream
    const qfIdx=Math.floor(pairIdx/2);
    const newQf=[...qf];newQf[qfIdx]={home:'TBD',away:'TBD',winner:null};setQf(newQf);
    const sfIdx=Math.floor(qfIdx/2);
    const newSf=[...sf];newSf[sfIdx]={home:'TBD',away:'TBD',winner:null};setSf(newSf);
    setFinal({home:'TBD',away:'TBD',winner:null});
  }

  function advanceR16(matchIdx,winner){
    const newR16=[...r16];newR16[matchIdx]={...newR16[matchIdx],winner};setR16(newR16);
    const newQf=[...qf];
    const pairIdx=Math.floor(matchIdx/2),slot=matchIdx%2===0?'home':'away';
    newQf[pairIdx]={...newQf[pairIdx],[slot]:winner,winner:null};setQf(newQf);
    const sfIdx=Math.floor(pairIdx/2);
    const newSf=[...sf];newSf[sfIdx]={home:'TBD',away:'TBD',winner:null};setSf(newSf);
    setFinal({home:'TBD',away:'TBD',winner:null});
  }

  function advanceQf(matchIdx,winner){
    const newQf=[...qf];newQf[matchIdx]={...newQf[matchIdx],winner};setQf(newQf);
    const newSf=[...sf];
    const pairIdx=Math.floor(matchIdx/2),slot=matchIdx%2===0?'home':'away';
    newSf[pairIdx]={...newSf[pairIdx],[slot]:winner,winner:null};setSf(newSf);
    setFinal({home:'TBD',away:'TBD',winner:null});
  }

  function advanceSf(matchIdx,winner){
    const newSf=[...sf];newSf[matchIdx]={...newSf[matchIdx],winner};setSf(newSf);
    const slot=matchIdx===0?'home':'away';
    setFinal(f=>({...f,[slot]:winner,winner:null}));
  }

  function reset(){
    setR32(initR32);
    setR16(Array(8).fill(null).map(()=>({home:'TBD',away:'TBD',winner:null})));
    setQf(Array(4).fill(null).map(()=>({home:'TBD',away:'TBD',winner:null})));
    setSf(Array(2).fill(null).map(()=>({home:'TBD',away:'TBD',winner:null})));
    setFinal({home:'TBD',away:'TBD',winner:null});
    setResetKey(k=>k+1);
  }

  function RoundTitle({children}){return(<div style={{display:"flex",alignItems:"center",gap:8,margin:"20px 0 10px"}}><div style={{fontSize:12,fontWeight:800,color:G,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</div><div style={{flex:1,height:1,background:"#1a1a1a"}}/></div>);}

  function MatchCard({match,onSelect,compact=false}){
    const {home,away,winner}=match;
    const tbd=home==='TBD'||away==='TBD';
    return(
      <div style={{background:"#080808",border:`1px solid ${winner?"#f59e0b33":"#141414"}`,borderRadius:10,padding:compact?"8px 10px":"12px 14px",marginBottom:8}}>
        {match.label&&!compact&&<div style={{fontSize:8,color:"#374151",fontWeight:700,marginBottom:6,lineHeight:1.4}}>{match.label}</div>}
        {[home,away].map((team,i)=>{
          const isWinner=winner===team;
          const isLoser=winner&&winner!==team;
          return(<div key={i}>
            {i===1&&<div style={{height:1,background:"#111",margin:"4px 0"}}/>}
            <button onClick={()=>!tbd&&team!=='TBD'&&onSelect(team)} disabled={tbd||team==='TBD'}
              style={{width:"100%",background:"none",border:"none",cursor:tbd?"default":"pointer",padding:"3px 0",display:"flex",alignItems:"center",gap:6,borderRadius:6,transition:"background 0.15s"}}>
              <span style={{fontSize:compact?14:16}}>{FLAGS[team]||"🏳️"}</span>
              <span style={{flex:1,fontSize:compact?10:12,fontWeight:isWinner?800:isLoser?400:600,color:isWinner?G:isLoser?"#374151":"#f9fafb",textAlign:"left",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{team}</span>
              {isWinner&&<span style={{fontSize:8,fontWeight:800,color:"#22c55e",background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:20,padding:"1px 5px"}}>✓</span>}
              {tbd&&i===0&&<span style={{fontSize:9,color:"#374151"}}>Pick above first</span>}
            </button>
          </div>);
        })}
      </div>
    );
  }

  return(
    <div style={{padding:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
        <div style={{fontSize:20,fontWeight:800}}>🗂 My Bracket</div>
        <button onClick={reset} style={{background:"#0f0f0f",border:"1px solid #1f1f1f",borderRadius:8,color:"#6b7280",fontSize:11,fontWeight:700,padding:"6px 12px",cursor:"pointer"}}>↺ Reset</button>
      </div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:20}}>Tap a team to advance them · Based on your group predictions</div>

      {/* Group standings summary */}
      <RoundTitle>Group Predictions</RoundTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
        {Object.entries(standings).map(([g,rows])=>(
          <div key={g} style={{background:"#080808",border:"1px solid #141414",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:9,fontWeight:800,color:G,letterSpacing:1,marginBottom:6}}>GROUP {g}</div>
            {rows.map((r,i)=>(
              <div key={r.team} style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                <span style={{fontSize:9,color:i<2?"#22c55e":"#4b5563",width:12,fontWeight:700}}>{i+1}</span>
                <span style={{fontSize:14}}>{FLAGS[r.team]||"🏳️"}</span>
                <span style={{fontSize:10,fontWeight:i<2?700:500,color:i<2?"#f9fafb":"#4b5563",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.team}</span>
                <span style={{fontSize:9,fontWeight:700,color:i<2?G:"#4b5563"}}>{r.pts}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Best 3rd */}
      <RoundTitle>Best 3rd Place Teams</RoundTitle>
      <div style={{background:"#0a0600",border:`1px solid ${G}22`,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:800,color:G,marginBottom:8}}>8 of 12 third-place teams advance</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {allThirds.map((t,i)=>(
            <div key={t.team} style={{fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:20,background:i<8?"rgba(34,197,94,0.1)":"#111",border:i<8?"1px solid rgba(34,197,94,0.3)":"1px solid #1f1f1f",color:i<8?"#22c55e":"#4b5563",textDecoration:i>=8?"line-through":"none"}}>
              {FLAGS[t.team]||"🏳️"} {t.team} · {t.pts}pts
            </div>
          ))}
        </div>
      </div>

      {/* R32 */}
      <RoundTitle>Round of 32 · Tap a team to advance</RoundTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {r32.map((m,i)=><MatchCard key={`${resetKey}_r32_${i}`} match={m} onSelect={w=>advanceR32(i,w)} compact/>)}
      </div>

      {/* R16 */}
      <RoundTitle>Round of 16</RoundTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {r16.map((m,i)=><MatchCard key={`${resetKey}_r16_${i}`} match={m} onSelect={w=>advanceR16(i,w)} compact/>)}
      </div>

      {/* QF */}
      <RoundTitle>Quarter-Finals</RoundTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {qf.map((m,i)=><MatchCard key={`${resetKey}_qf_${i}`} match={{...m,label:undefined}} onSelect={w=>advanceQf(i,w)}/>)}
      </div>

      {/* SF */}
      <RoundTitle>Semi-Finals</RoundTitle>
      {sf.map((m,i)=><MatchCard key={`${resetKey}_sf_${i}`} match={m} onSelect={w=>advanceSf(i,w)}/>)}

      {/* Final */}
      <RoundTitle>The Final · Jul 19 · MetLife Stadium</RoundTitle>
      {final.winner?(
        <div style={{background:"linear-gradient(135deg,#1a0f00,#0a0a0a)",border:`1px solid ${G}44`,borderRadius:16,padding:20,textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:36,marginBottom:8}}>🏆</div>
          <div style={{fontSize:20,fontWeight:800,color:G,marginBottom:4}}>{FLAGS[final.winner]||"🏳️"} {final.winner}</div>
          <div style={{fontSize:11,color:"#6b7280"}}>Your predicted World Cup 2026 Champion</div>
        </div>
      ):(
        <MatchCard key={`${resetKey}_final`} match={final} onSelect={w=>setFinal(f=>({...f,winner:w}))}/>
      )}

      <div style={{fontSize:11,color:"#374151",textAlign:"center",fontStyle:"italic",marginTop:12,lineHeight:1.6}}>
        ⚠️ Third-place matchups are approximated — exact pairings are confirmed after all group games finish on Jun 28.
      </div>
    </div>
  );
}
