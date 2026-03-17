/**
 * DAC7 Reporting Service — F7000 Form Generation
 * 
 * Implements EU Directive 2021/514 (DAC7) reporting requirements.
 * Generates the annual F7000 form for ANAF, reporting:
 * - All platform sellers and their transaction volumes
 * - KYC data for each entity (CUI, address, etc.)
 * - Total consideration amounts per seller per quarter
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';

export interface DAC7ReportEntry {
    companyName: string;
    cui: string;
    address: string;
    totalConsideration: number;
    platformFees: number;
    transactionCount: number;
    quarters: { q1: number; q2: number; q3: number; q4: number };
}

export interface DAC7Report {
    reportingYear: number;
    platformOperator: string;
    platformCUI: string;
    generatedAt: Date;
    totalEntities: number;
    totalVolume: number;
    totalFees: number;
    entries: DAC7ReportEntry[];
}

@Injectable()
export class DAC7Service {
    constructor(
        @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    ) { }

    /** Generate DAC7 F7000 report for a given year */
    async generateReport(year: number): Promise<DAC7Report> {
        // Fetch all completed orders for the year
        const orders = await this.orderRepo.find({
            where: { status: OrderStatus.COMPLETED },
            relations: ['seller'],
        });

        // Filter by year
        const yearOrders = orders.filter(o => {
            const orderYear = o.createdAt?.getFullYear() || new Date().getFullYear();
            return orderYear === year;
        });

        // Group by seller company
        const sellerMap = new Map<string, DAC7ReportEntry>();

        for (const order of yearOrders) {
            const companyName = order.seller?.companyName || 'N/A';
            const cui = order.seller?.cui || 'N/A';

            if (!sellerMap.has(cui)) {
                sellerMap.set(cui, {
                    companyName,
                    cui,
                    address: order.seller?.legalAddress || 'N/A',
                    totalConsideration: 0,
                    platformFees: 0,
                    transactionCount: 0,
                    quarters: { q1: 0, q2: 0, q3: 0, q4: 0 },
                });
            }

            const entry = sellerMap.get(cui)!;
            entry.totalConsideration += order.totalValue || 0;
            entry.platformFees += order.platformFee || 0;
            entry.transactionCount += 1;

            // Assign to quarter
            const month = order.createdAt?.getMonth() || 0;
            const qtrKey = month < 3 ? 'q1' : month < 6 ? 'q2' : month < 9 ? 'q3' : 'q4';
            entry.quarters[qtrKey] += order.totalValue || 0;
        }

        const entries = Array.from(sellerMap.values());

        return {
            reportingYear: year,
            platformOperator: 'AgriConnect Platform SRL',
            platformCUI: 'RO99999999',
            generatedAt: new Date(),
            totalEntities: entries.length,
            totalVolume: entries.reduce((sum, e) => sum + e.totalConsideration, 0),
            totalFees: entries.reduce((sum, e) => sum + e.platformFees, 0),
            entries,
        };
    }
}
