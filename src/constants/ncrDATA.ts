const philippinesData = require("../../app/assets/data/philippines.json");

export type BarangayMap = Record<string, string[]>;
export type DistrictCityMap = Record<string, string[]>;
export type CityMunicipalityMap = { city: string; municipality: string };

export const ncrDistricts: string[] = Object.keys(philippinesData.province_list || {});
export const districtCityMap: DistrictCityMap = {};
export const cityMunicipalityList: CityMunicipalityMap[] = [];
export const barangayMap: BarangayMap = {};

ncrDistricts.forEach((districtName) => {
    const districtData = philippinesData.province_list[districtName];
    const municipalities = districtData?.municipality_list || {};
    const cities: string[] = [];

    Object.entries(municipalities).forEach(([cityName, cityData]) => {
        cities.push(cityName);
        cityMunicipalityList.push({city: cityName, municipality: "Metro Manila"});

        const barangays = cityData.barangay_list;
        if (Array.isArray(barangays)) {
            barangayMap[cityName] = barangays;
        }
    });

    districtCityMap[districtName] = cities;
});