import React, {useState, useEffect} from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from './InfoBox';
import './App.css';
import Table from "./Table";
import {sortData, prettyPrintStat} from "./util";
import LineGraph from "./LineGraph";
import Map from "./Map";
import "leaflet/dist/leaflet.css";
//npm i react-leaflet   1.6.0 download
//npm i leaflet


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data);
    });
  }, [])

  useEffect(() => {    
    const getCountriesData = async () => {
      fetch ("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
              name : country.country,
              value : country.countryInfo.iso2,
            }));

            let sortedData = sortData(data);
            setTableData(sortedData);
            setMapCountries(data);
            setCountries(countries);
          });
        };
        
        getCountriesData();
    }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url = 
      countryCode === "worldwide" 
        ? "https://disease.sh/v3/covid-19/all" 
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);

        countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };


  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid 19 tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}          
            title="Coronavirus cases"
            isRed
            active={casesType === "cases"} 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}         
            title="Recovered" 
            active={casesType === "recovered"}             
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox 
            onClick={(e) => setCasesType("deaths")}
            title="Deaths" 
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)}/>
        </div>
        
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        /> 
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live by country</h3>
          <Table countries={tableData}/>
          <h3>Worldwide new {casesType}</h3>
          <LineGraph casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;

// 1.02.42
