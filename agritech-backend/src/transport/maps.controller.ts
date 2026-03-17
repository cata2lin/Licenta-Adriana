/**
 * Google Maps Proxy Controller
 * 
 * Proxies Google Maps API calls to keep the API key secure on the server.
 * Endpoints:
 * - GET  /maps/autocomplete?input=...  — Places Autocomplete (Romanian addresses)
 * - GET  /maps/place-details/:placeId  — Place Details (coordinates, zip code)
 * - POST /maps/distance                — Distance Matrix (real road distance)
 */
import { Controller, Get, Post, Query, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller('maps')
export class MapsController {
    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY', '');
    }

    /**
     * Places Autocomplete — restricted to Romania
     * Returns structured address suggestions with place_id
     */
    @Get('autocomplete')
    async autocomplete(
        @Query('input') input: string,
        @Query('types') types?: string,
    ) {
        if (!input || input.length < 2) return { predictions: [] };
        if (!this.apiKey) {
            // Fallback: return mock Romanian addresses for demo
            return this.getMockPredictions(input);
        }

        try {
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/place/autocomplete/json',
                {
                    params: {
                        input,
                        key: this.apiKey,
                        components: 'country:ro', // Romania only
                        language: 'ro',
                        types: types || 'geocode',
                    },
                },
            );
            return {
                predictions: response.data.predictions.map((p: any) => ({
                    placeId: p.place_id,
                    description: p.description,
                    mainText: p.structured_formatting?.main_text || p.description,
                    secondaryText: p.structured_formatting?.secondary_text || '',
                })),
            };
        } catch (error) {
            return this.getMockPredictions(input);
        }
    }

    /**
     * Place Details — get coordinates, zip code, county
     */
    @Get('place-details/:placeId')
    async placeDetails(@Param('placeId') placeId: string) {
        if (!this.apiKey) {
            return this.getMockPlaceDetails(placeId);
        }

        try {
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/place/details/json',
                {
                    params: {
                        place_id: placeId,
                        key: this.apiKey,
                        fields: 'geometry,address_component,formatted_address',
                        language: 'ro',
                    },
                },
            );
            const result = response.data.result;
            const components = result.address_components || [];

            return {
                formattedAddress: result.formatted_address,
                lat: result.geometry?.location?.lat,
                lng: result.geometry?.location?.lng,
                postalCode: components.find((c: any) => c.types.includes('postal_code'))?.long_name || '',
                county: components.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name || '',
                city: components.find((c: any) => c.types.includes('locality'))?.long_name || '',
            };
        } catch (error) {
            return this.getMockPlaceDetails(placeId);
        }
    }

    /**
     * Distance Matrix — real road distance between two points
     * Returns distance in km and duration in minutes
     */
    @Post('distance')
    async distance(@Body() body: { origin: string; destination: string }) {
        if (!body.origin || !body.destination) {
            throw new HttpException('Origin and destination required', HttpStatus.BAD_REQUEST);
        }

        if (!this.apiKey) {
            return this.getMockDistance(body.origin, body.destination);
        }

        try {
            const response = await axios.get(
                'https://maps.googleapis.com/maps/api/distancematrix/json',
                {
                    params: {
                        origins: body.origin,
                        destinations: body.destination,
                        key: this.apiKey,
                        mode: 'driving',
                        language: 'ro',
                        region: 'ro',
                    },
                },
            );

            const element = response.data.rows?.[0]?.elements?.[0];
            if (!element || element.status !== 'OK') {
                return this.getMockDistance(body.origin, body.destination);
            }

            const distanceKm = Math.round(element.distance.value / 1000);
            const durationMin = Math.round(element.duration.value / 60);

            return {
                distanceKm,
                durationMin,
                distanceText: element.distance.text,
                durationText: element.duration.text,
                originAddress: response.data.origin_addresses?.[0] || body.origin,
                destAddress: response.data.destination_addresses?.[0] || body.destination,
                source: 'google_maps',
            };
        } catch (error) {
            return this.getMockDistance(body.origin, body.destination);
        }
    }

    // ─── Mock Fallback (for demo without API key) ───

    private getMockPredictions(input: string) {
        const allCities = [
            { city: 'București', county: 'București', postalCode: '010101' },
            { city: 'Constanța', county: 'Constanța', postalCode: '900001' },
            { city: 'Cluj-Napoca', county: 'Cluj', postalCode: '400001' },
            { city: 'Timișoara', county: 'Timiș', postalCode: '300001' },
            { city: 'Iași', county: 'Iași', postalCode: '700001' },
            { city: 'Brăila', county: 'Brăila', postalCode: '810001' },
            { city: 'Galați', county: 'Galați', postalCode: '800001' },
            { city: 'Craiova', county: 'Dolj', postalCode: '200001' },
            { city: 'Brașov', county: 'Brașov', postalCode: '500001' },
            { city: 'Ploiești', county: 'Prahova', postalCode: '100001' },
            { city: 'Oradea', county: 'Bihor', postalCode: '410001' },
            { city: 'Arad', county: 'Arad', postalCode: '310001' },
            { city: 'Sibiu', county: 'Sibiu', postalCode: '550001' },
            { city: 'Pitești', county: 'Argeș', postalCode: '110001' },
            { city: 'Buzău', county: 'Buzău', postalCode: '120001' },
            { city: 'Suceava', county: 'Suceava', postalCode: '720001' },
            { city: 'Botoșani', county: 'Botoșani', postalCode: '710001' },
            { city: 'Satu Mare', county: 'Satu Mare', postalCode: '440001' },
            { city: 'Tulcea', county: 'Tulcea', postalCode: '820001' },
            { city: 'Călărași', county: 'Călărași', postalCode: '910001' },
            { city: 'Giurgiu', county: 'Giurgiu', postalCode: '080001' },
            { city: 'Alexandria', county: 'Teleorman', postalCode: '140001' },
            { city: 'Slobozia', county: 'Ialomița', postalCode: '920001' },
            { city: 'Focșani', county: 'Vrancea', postalCode: '620001' },
            { city: 'Alba Iulia', county: 'Alba', postalCode: '510001' },
            { city: 'Deva', county: 'Hunedoara', postalCode: '330001' },
            { city: 'Târgu Mureș', county: 'Mureș', postalCode: '540001' },
            { city: 'Bistrița', county: 'Bistrița-Năsăud', postalCode: '420001' },
            { city: 'Zalău', county: 'Sălaj', postalCode: '450001' },
            { city: 'Baia Mare', county: 'Maramureș', postalCode: '430001' },
            { city: 'Târgoviște', county: 'Dâmbovița', postalCode: '130001' },
            { city: 'Râmnicu Vâlcea', county: 'Vâlcea', postalCode: '240001' },
            { city: 'Drobeta-Turnu Severin', county: 'Mehedinți', postalCode: '220001' },
            { city: 'Reșița', county: 'Caraș-Severin', postalCode: '320001' },
            { city: 'Sfântu Gheorghe', county: 'Covasna', postalCode: '520001' },
            { city: 'Miercurea Ciuc', county: 'Harghita', postalCode: '530001' },
            { city: 'Piatra Neamț', county: 'Neamț', postalCode: '610001' },
            { city: 'Vaslui', county: 'Vaslui', postalCode: '730001' },
            { city: 'Bacău', county: 'Bacău', postalCode: '600001' },
            { city: 'Mediaș', county: 'Sibiu', postalCode: '551001' },
            { city: 'Tecuci', county: 'Galați', postalCode: '805300' },
        ];

        const normalizedInput = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const filtered = allCities.filter(c => {
            const normalizedCity = c.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const normalizedCounty = c.county.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return normalizedCity.includes(normalizedInput) || normalizedCounty.includes(normalizedInput) || c.postalCode.startsWith(input);
        }).slice(0, 5);

        return {
            predictions: filtered.map(c => ({
                placeId: `mock_${c.city.toLowerCase().replace(/\s/g, '_')}`,
                description: `${c.city}, Județul ${c.county}, ${c.postalCode}, România`,
                mainText: c.city,
                secondaryText: `Județul ${c.county}, ${c.postalCode}`,
            })),
        };
    }

    private getMockPlaceDetails(placeId: string) {
        const COORDS: Record<string, { lat: number; lng: number; postalCode: string; county: string; city: string }> = {
            'mock_bucuresti': { lat: 44.4268, lng: 26.1025, postalCode: '010101', county: 'București', city: 'București' },
            'mock_constanta': { lat: 44.1598, lng: 28.6348, postalCode: '900001', county: 'Constanța', city: 'Constanța' },
            'mock_cluj-napoca': { lat: 46.7712, lng: 23.6236, postalCode: '400001', county: 'Cluj', city: 'Cluj-Napoca' },
            'mock_timisoara': { lat: 45.7489, lng: 21.2087, postalCode: '300001', county: 'Timiș', city: 'Timișoara' },
            'mock_iasi': { lat: 47.1585, lng: 27.6014, postalCode: '700001', county: 'Iași', city: 'Iași' },
            'mock_braila': { lat: 45.2745, lng: 27.9639, postalCode: '810001', county: 'Brăila', city: 'Brăila' },
            'mock_galati': { lat: 45.4353, lng: 28.0080, postalCode: '800001', county: 'Galați', city: 'Galați' },
            'mock_craiova': { lat: 44.3302, lng: 23.7949, postalCode: '200001', county: 'Dolj', city: 'Craiova' },
            'mock_brasov': { lat: 45.6427, lng: 25.5887, postalCode: '500001', county: 'Brașov', city: 'Brașov' },
            'mock_ploiesti': { lat: 44.9462, lng: 26.0250, postalCode: '100001', county: 'Prahova', city: 'Ploiești' },
        };
        const data = COORDS[placeId] || { lat: 44.4268, lng: 26.1025, postalCode: '010101', county: 'București', city: 'București' };
        return { formattedAddress: `${data.city}, Județul ${data.county}, România`, ...data };
    }

    private getMockDistance(origin: string, destination: string) {
        // Haversine approximation from mock coordinates
        const cities: Record<string, { lat: number; lng: number }> = {
            'bucurești': { lat: 44.4268, lng: 26.1025 }, 'constanța': { lat: 44.1598, lng: 28.6348 },
            'cluj-napoca': { lat: 46.7712, lng: 23.6236 }, 'timișoara': { lat: 45.7489, lng: 21.2087 },
            'iași': { lat: 47.1585, lng: 27.6014 }, 'brăila': { lat: 45.2745, lng: 27.9639 },
            'craiova': { lat: 44.3302, lng: 23.7949 }, 'brașov': { lat: 45.6427, lng: 25.5887 },
            'galați': { lat: 45.4353, lng: 28.0080 }, 'sibiu': { lat: 45.7983, lng: 24.1256 },
            'oradea': { lat: 47.0722, lng: 21.9212 }, 'arad': { lat: 46.1866, lng: 21.3123 },
            'ploiești': { lat: 44.9462, lng: 26.0250 }, 'pitești': { lat: 44.8565, lng: 24.8692 },
            'suceava': { lat: 47.6635, lng: 26.2596 }, 'bacău': { lat: 46.5674, lng: 26.9135 },
        };
        const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/,.*$/, '').trim();
        const o = cities[normalize(origin)];
        const d = cities[normalize(destination)];

        if (!o || !d) {
            const randomDist = 150 + Math.floor(Math.random() * 350);
            return { distanceKm: randomDist, durationMin: Math.round(randomDist / 65 * 60), distanceText: `${randomDist} km`, durationText: `${Math.floor(randomDist / 65)}h ${Math.round((randomDist / 65 % 1) * 60)}min`, originAddress: origin, destAddress: destination, source: 'estimate' };
        }

        const R = 6371;
        const dLat = (d.lat - o.lat) * Math.PI / 180;
        const dLng = (d.lng - o.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(o.lat * Math.PI / 180) * Math.cos(d.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        const straight = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Math.round(straight * 1.35);
        const durationMin = Math.round(distanceKm / 65 * 60);

        return {
            distanceKm, durationMin,
            distanceText: `${distanceKm} km`,
            durationText: `${Math.floor(durationMin / 60)}h ${durationMin % 60}min`,
            originAddress: origin, destAddress: destination, source: 'haversine',
        };
    }
}
