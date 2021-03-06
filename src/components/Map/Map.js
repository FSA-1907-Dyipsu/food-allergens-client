import React, { Component } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import axios from 'axios';
import Ping from '../Ping/Ping.js'
import searchIcon from '../../assets/images/Nav_Icons/Search_Icon Copy.png'
import currentLocationIcon from '../../assets/images/CurrentLocation.svg'
import { debounce } from 'underscore';
import './Map.css';

class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {
            viewport: {
                width: '100vw',
                height: '100vh',
                latitude: 40.705254,
                longitude: -74.008917,
                zoom: 16
            },
            restaurants: [{
                id: "81cad0fa-b9a5-44f1-aa1a-6c1ef9d4da0e",
                street: "127 Pearl St",
                city: "New York",
                state: "NY",
                country: "USA",
                zip: "10005",
                geolocation: [
                    40.704881,
                    -74.008656
                ],
                restaurantId: "4519ffb3-f340-44f1-9519-8804d096e1e0",
                createdAt: "2019-12-07T18:34:35.678Z",
                updatedAt: "2019-12-07T18:34:35.678Z"
            }],
            searchText: '',
            searchedRestos: []
        }
        this.handleSearchChangeThrottled = debounce(this.handleSearchChange, 300)
    };
    componentDidMount() {
        this.getRestaurant()
    }
    locateUser = () => {
        // https://developer.mozilla.org/en-US/docs/Web/Geolocation/Using_geolocation
        navigator.geolocation.getCurrentPosition(async (position) => {
            this.setState({
                viewport: {
                    width: '100vw',
                    height: '100vh',
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude,
                    zoom: 18
                }
            });
        });
    }
    getRestaurant = async () => {
        const newRestaurants = (await axios.get(`${process.env.REACT_APP_PROXY}/restaurants/location/${this.state.viewport.latitude}/${this.state.viewport.longitude}`)).data;
        this.setState({ restaurants: newRestaurants })
    }
    closeEffect = () => {
        const listener = async (e) => {
            if (e.key === "Escape") {
                await this.setState({ selectedRestaurant: null })
            }
        };
        window.addEventListener("keydown", listener);
    }
    handleSearchChange({ target }) {
        if (target) {
            const { restaurants, searchText } = this.state
            this.setState({ searchText: target.value })
            const searched = target.value ? restaurants.filter(resto => resto.name.toLowerCase().includes(searchText)) : []
            this.setState({ searchedRestos: searched })
        }
    }
    delaySearchChange(event) {
        event.persist()
        this.handleSearchChangeThrottled(event)
    }
    onRestaurantSelection = (restaurant) => {
        this.setState({ selectedRestaurant: restaurant })
    }
    render() {
        const { restaurants, selectedRestaurant, searchText, searchedRestos } = this.state;
        const { filters, onRestaurantSelection } = this.props
        const { setSelectedRestaurant, closeEffect, locateUser, filterByAllergen } = this
        closeEffect()
        return (
            <div id="map-container">
                <div id="location-bar">
                    <div id="search-bar">
                        <img src={searchIcon} id="searchIcon" alt="" />
                        <input type="text" id="searchfield" onChange={(ev) => this.delaySearchChange(ev)} placeholder="Search a restaurant" />
                    </div>
                    <img src={currentLocationIcon} id="btn-current-location" onClick={locateUser} />
                </div>
                <ReactMapGL
                    {...this.state.viewport}
                    mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
                    mapStyle="mapbox://styles/grey-matter/ck3800c9m5wec1cp6j6wffxii"
                    onViewportChange={(viewport) => this.setState({ viewport })}
                >
                    {searchedRestos.length ?
                        searchedRestos.map((restaurant, idx) => (
                            <button key={idx} onClick={() => {
                                this.setState({ selectedRestaurant: restaurant })
                                onRestaurantSelection(restaurant)
                            }}>
                                <Marker key={restaurant.id}
                                    latitude={restaurant.geolocation[0] * 1}
                                    longitude={restaurant.geolocation[1] * 1}
                                >
                                    <Ping restaurant={restaurant} filters={filters} />
                                </Marker>
                            </button>
                        )) :
                        restaurants.map((restaurant, idx) => (
                            <button key={idx} onClick={() => {
                                this.setState({ selectedRestaurant: restaurant })
                                onRestaurantSelection(restaurant)
                            }}>
                                <Marker key={restaurant.id}
                                    latitude={restaurant.geolocation[0] * 1}
                                    longitude={restaurant.geolocation[1] * 1}
                                >
                                    <Ping restaurant={restaurant} filters={filters} />
                                </Marker>
                            </button>
                        ))
                    }
                </ReactMapGL>
            </div>);
    }
}

export default Map;