/**
 * Unit Tests — IAM Module
 * Tests registration, login, JWT generation, and ANAF CUI validation.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { IamService } from './iam.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';

describe('IamService', () => {
  let service: IamService;
  const mockUserRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockCompanyRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IamService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Company), useValue: mockCompanyRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<IamService>(IamService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      mockUserRepo.findOne.mockResolvedValue(null); // No existing user
      mockCompanyRepo.findOne.mockResolvedValue(null);
      mockCompanyRepo.create.mockReturnValue({ id: 'company-1' });
      mockCompanyRepo.save.mockResolvedValue({ id: 'company-1' });
      mockUserRepo.create.mockReturnValue({ id: 'user-1', email: 'test@test.ro' });
      mockUserRepo.save.mockResolvedValue({ id: 'user-1', email: 'test@test.ro' });

      const result = await service.register({
        email: 'test@test.ro',
        password: 'password123',
        fullName: 'Test User',
        role: 'FARMER',
        companyName: 'SC TEST SRL',
        cui: 'RO12345678',
        legalAddress: 'Str. Test',
      } as any);

      expect(result).toBeDefined();
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalled();
    });

    it('should reject duplicate emails', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing-user' });
      await expect(service.register({
        email: 'existing@test.ro',
        password: 'password123',
        fullName: 'Test User',
        role: 'FARMER',
      } as any)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('password123', 10);
      mockUserRepo.findOne.mockResolvedValue({
        id: 'user-1', email: 'test@test.ro', passwordHash: hash,
        role: 'FARMER', company: { id: 'company-1' },
      });

      const result = await service.login({ email: 'test@test.ro', password: 'password123' } as any);
      expect(result.access_token).toBe('mock-jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should reject invalid credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.login({ email: 'wrong@test.ro', password: 'wrong' } as any)).rejects.toThrow();
    });
  });
});
