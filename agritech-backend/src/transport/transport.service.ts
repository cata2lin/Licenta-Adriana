/**
 * Transport Service — Routing, Shipment Management & Compliance
 * 
 * Handles:
 * - OSRM route calculation (simulated — in production: HTTP call to OSRM C++ server)
 * - Shipment lifecycle management
 * - RO e-Transport UIT code generation (simulated — in production: ANAF API)
 * - 123cargo bidding simulation (in production: Alpega Group API)
 * - Make-or-Buy cost comparison (own fleet vs market rate)
 * 
 * This module is 100% isolated from Trading, Financial, and IAM modules.
 * Communication happens only through entity IDs.
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment, ShipmentStatus } from './entities/shipment.entity';
import { CreateShipmentDto, CalculateRouteDto, UpdateShipmentStatusDto, AssignTransporterDto } from './dto/transport.dto';

/** Simulated Romanian city coordinates for OSRM routing */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    'bucurești': { lat: 44.4268, lng: 26.1025 },
    'constanța': { lat: 44.1598, lng: 28.6348 },
    'brăila': { lat: 45.2745, lng: 27.9639 },
    'buzău': { lat: 45.1500, lng: 26.8333 },
    'timișoara': { lat: 45.7489, lng: 21.2087 },
    'timiș': { lat: 45.7489, lng: 21.2087 },
    'cluj-napoca': { lat: 46.7712, lng: 23.6236 },
    'iași': { lat: 47.1585, lng: 27.6014 },
    'sibiu': { lat: 45.7983, lng: 24.1256 },
    'craiova': { lat: 44.3302, lng: 23.7949 },
    'galați': { lat: 45.4353, lng: 28.0080 },
    'ploiești': { lat: 44.9462, lng: 26.0250 },
    'arad': { lat: 46.1866, lng: 21.3123 },
    'oradea': { lat: 47.0722, lng: 21.9212 },
    'brașov': { lat: 45.6427, lng: 25.5887 },
    'pitești': { lat: 44.8565, lng: 24.8692 },
    'suceava': { lat: 47.6635, lng: 26.2596 },
    'botoșani': { lat: 47.7487, lng: 26.6694 },
    'satu mare': { lat: 47.7923, lng: 22.8854 },
    'tulcea': { lat: 45.1786, lng: 28.7953 },
    'călărași': { lat: 44.2050, lng: 27.3306 },
    'giurgiu': { lat: 43.9037, lng: 25.9699 },
    'alexandria': { lat: 43.9740, lng: 25.3346 },
    'slobozia': { lat: 44.5644, lng: 27.3660 },
};

/** Market rate ranges per km for transport (RON/km) */
const MARKET_RATE_MIN = 4.2;
const MARKET_RATE_MAX = 6.0;
const OWN_FLEET_RATE = 6.0;

@Injectable()
export class TransportService {
    constructor(
        @InjectRepository(Shipment) private readonly shipmentRepo: Repository<Shipment>,
    ) { }

    // ─── OSRM Route Calculation (Simulated) ───

    /**
     * Simulates OSRM routing calculation.
     * In production: HTTP GET to http://osrm-server:5000/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full
     * with a custom heavy vehicle LUA profile (weight=distance, avoiding restricted roads).
     */
    async calculateRoute(dto: CalculateRouteDto): Promise<{
        distanceKm: number;
        durationMin: number;
        originCoords: { lat: number; lng: number };
        destCoords: { lat: number; lng: number };
        costOwnFleet: number;
        costMarket: number;
        savings: number;
        marketRate: number;
    }> {
        const originKey = dto.origin.toLowerCase().trim();
        const destKey = dto.destination.toLowerCase().trim();

        const originCoords = CITY_COORDS[originKey];
        const destCoords = CITY_COORDS[destKey];

        if (!originCoords || !destCoords) {
            throw new BadRequestException(
                `City not found. Available: ${Object.keys(CITY_COORDS).join(', ')}`,
            );
        }

        // Haversine distance formula (simplified, km)
        const R = 6371;
        const dLat = (destCoords.lat - originCoords.lat) * Math.PI / 180;
        const dLng = (destCoords.lng - originCoords.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(originCoords.lat * Math.PI / 180) * Math.cos(destCoords.lat * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
        const straightLine = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Road distance ≈ straight line × 1.35 (road factor for Romania)
        const distanceKm = Math.round(straightLine * 1.35);
        const durationMin = Math.round(distanceKm / 65 * 60); // avg 65 km/h for heavy vehicles

        const marketRate = MARKET_RATE_MIN + Math.random() * (MARKET_RATE_MAX - MARKET_RATE_MIN);
        const costOwnFleet = Math.round(distanceKm * OWN_FLEET_RATE);
        const costMarket = Math.round(distanceKm * marketRate);

        return {
            distanceKm,
            durationMin,
            originCoords,
            destCoords,
            costOwnFleet,
            costMarket,
            savings: costOwnFleet - costMarket,
            marketRate: Math.round(marketRate * 100) / 100,
        };
    }

    // ─── RO e-Transport UIT Code Generation (Simulated) ───

    /**
     * Generates a UIT code for RO e-Transport ANAF compliance.
     * In production: POST to https://api.anaf.ro/prod/ETRANSPORT/v2 with shipment details.
     * The UIT must be generated BEFORE the vehicle departs.
     */
    private generateUIT(): string {
        const year = new Date().getFullYear().toString().slice(-2);
        const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
        return `RO${year}T-${seq}`;
    }

    // ─── 123cargo Bidding Simulation ───

    /**
     * Simulates posting a transport request to 123cargo (Alpega Group).
     * In production: POST to 123cargo API with route, cargo details, and requirements.
     * Returns simulated bids from transporters.
     */
    async simulateCargoBidding(shipmentId: string): Promise<{
        bidId: string;
        bids: Array<{
            transporter: string;
            score: number;
            ratePerKm: number;
            totalCost: number;
            trend: string;
        }>;
    }> {
        const shipment = await this.findShipmentById(shipmentId);
        const distKm = Number(shipment.distanceKm);

        const bids = [
            { transporter: 'SC TRANS RAPID SRL', score: 4.7, ratePerKm: 4.8, totalCost: Math.round(distKm * 4.8), trend: 'STABIL' },
            { transporter: 'SC EURO CARGO SRL', score: 4.5, ratePerKm: 5.1, totalCost: Math.round(distKm * 5.1), trend: 'CRESCĂTOR' },
            { transporter: 'SC VEST TRANS SRL', score: 4.8, ratePerKm: 4.5, totalCost: Math.round(distKm * 4.5), trend: 'STABIL' },
            { transporter: 'SC AUTO CERES SRL', score: 4.2, ratePerKm: 4.3, totalCost: Math.round(distKm * 4.3), trend: 'DESCRESCĂTOR' },
        ].sort((a, b) => b.score - a.score); // Sort by score (best first)

        return {
            bidId: `BID-${Date.now().toString().slice(-8)}`,
            bids,
        };
    }

    // ─── Shipment CRUD ───

    async createShipment(dto: CreateShipmentDto): Promise<Shipment> {
        // Calculate route
        const route = await this.calculateRoute({
            origin: dto.originAddress,
            destination: dto.destAddress,
        });

        const shipment = this.shipmentRepo.create({
            shipmentRef: `SHP-${Date.now().toString().slice(-7)}`,
            order: dto.orderId ? { id: dto.orderId } as any : null,
            originAddress: dto.originAddress,
            originCounty: dto.originCounty,
            originLat: route.originCoords.lat,
            originLng: route.originCoords.lng,
            destAddress: dto.destAddress,
            destCounty: dto.destCounty,
            destLat: route.destCoords.lat,
            destLng: route.destCoords.lng,
            distanceKm: route.distanceKm,
            durationMin: route.durationMin,
            cargoDescription: dto.cargoDescription,
            weightTonnes: dto.weightTonnes,
            vehicleType: dto.vehicleType || 'Basculantă 24t',
            ratePerKm: route.marketRate,
            totalCost: route.costMarket,
            pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
            notes: dto.notes,
            status: ShipmentStatus.PLANNED,
        });

        return this.shipmentRepo.save(shipment);
    }

    async findShipmentById(id: string): Promise<Shipment> {
        const shipment = await this.shipmentRepo.findOne({ where: { id }, relations: ['transporter', 'order'] });
        if (!shipment) throw new NotFoundException(`Shipment ${id} not found`);
        return shipment;
    }

    async findAllShipments(page = 1, limit = 20): Promise<{ shipments: Shipment[]; total: number }> {
        const [shipments, total] = await this.shipmentRepo.findAndCount({
            relations: ['transporter'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { shipments, total };
    }

    async findShipmentsByStatus(status: ShipmentStatus): Promise<Shipment[]> {
        return this.shipmentRepo.find({
            where: { status },
            relations: ['transporter'],
            order: { createdAt: 'DESC' },
        });
    }

    // ─── Status Transitions ───

    async updateShipmentStatus(id: string, dto: UpdateShipmentStatusDto): Promise<Shipment> {
        const shipment = await this.findShipmentById(id);
        this.validateShipmentTransition(shipment.status, dto.status);

        shipment.status = dto.status;
        if (dto.notes) shipment.notes = dto.notes;

        // Auto-generate UIT when transitioning to IN_TRANSIT
        if (dto.status === ShipmentStatus.IN_TRANSIT) {
            shipment.uitCode = dto.uitCode || this.generateUIT();
        }

        if (dto.status === ShipmentStatus.DELIVERED) {
            shipment.deliveryDate = new Date();
        }

        return this.shipmentRepo.save(shipment);
    }

    private validateShipmentTransition(current: ShipmentStatus, next: ShipmentStatus): void {
        const allowed: Record<ShipmentStatus, ShipmentStatus[]> = {
            [ShipmentStatus.PLANNED]: [ShipmentStatus.BIDDING, ShipmentStatus.ASSIGNED, ShipmentStatus.CANCELLED],
            [ShipmentStatus.BIDDING]: [ShipmentStatus.ASSIGNED, ShipmentStatus.CANCELLED],
            [ShipmentStatus.ASSIGNED]: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED],
            [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.DELIVERED],
            [ShipmentStatus.DELIVERED]: [],
            [ShipmentStatus.CANCELLED]: [],
        };

        if (!allowed[current]?.includes(next)) {
            throw new BadRequestException(`Cannot transition shipment from ${current} to ${next}`);
        }
    }

    // ─── Transporter Assignment ───

    async assignTransporter(id: string, dto: AssignTransporterDto): Promise<Shipment> {
        const shipment = await this.findShipmentById(id);
        if (shipment.status !== ShipmentStatus.PLANNED && shipment.status !== ShipmentStatus.BIDDING) {
            throw new BadRequestException('Can only assign transporter to PLANNED or BIDDING shipments');
        }

        shipment.transporter = { id: dto.transporterId } as any;
        shipment.ratePerKm = dto.agreedRate;
        shipment.totalCost = Math.round(Number(shipment.distanceKm) * dto.agreedRate);
        shipment.transporterScore = dto.transporterScore || null;
        shipment.status = ShipmentStatus.ASSIGNED;

        return this.shipmentRepo.save(shipment);
    }

    // ─── Statistics ───

    async getStats(): Promise<Record<string, any>> {
        const total = await this.shipmentRepo.count();
        const active = await this.shipmentRepo.count({ where: { status: ShipmentStatus.IN_TRANSIT } });
        const delivered = await this.shipmentRepo.count({ where: { status: ShipmentStatus.DELIVERED } });

        const distResult = await this.shipmentRepo
            .createQueryBuilder('s')
            .select('SUM(s.distance_km)', 'totalKm')
            .addSelect('AVG(s.rate_per_km)', 'avgRate')
            .getRawOne();

        return {
            total,
            active,
            delivered,
            totalKm: parseFloat(distResult?.totalKm || '0'),
            avgRatePerKm: parseFloat(distResult?.avgRate || '0'),
        };
    }
}
