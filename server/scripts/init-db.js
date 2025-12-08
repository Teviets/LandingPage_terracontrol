#!/usr/bin/env node

/**
 * Script de inicialización de base de datos
 * Ejecuta migraciones y seeders automáticamente
 * 
 * Uso: node scripts/init-db.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`)
};

async function runMigrations() {
  try {
    log.info('Ejecutando migraciones de Prisma...');
    
    // Si usas Prisma, ejecutar comando de migraciones
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    log.success('Migraciones completadas');
    return true;
  } catch (error) {
    log.error(`Error en migraciones: ${error.message}`);
    return false;
  }
}

async function runSeeders() {
  try {
    log.info('Ejecutando seeders...');
    
    const seederPath = path.join(__dirname, '../prisma/seed.js');
    
    if (fs.existsSync(seederPath)) {
      // Ejecutar el seeder de Prisma
      const { execSync } = require('child_process');
      execSync('npx prisma db seed', { stdio: 'inherit' });
      
      log.success('Seeders completados');
      return true;
    } else {
      log.warn('No se encontró archivo de seeder');
      return true;
    }
  } catch (error) {
    log.error(`Error en seeders: ${error.message}`);
    return false;
  }
}

async function verifyConnection() {
  try {
    log.info('Verificando conexión a la base de datos...');
    await prisma.$queryRaw`SELECT 1`;
    log.success('Conexión a BD exitosa');
    return true;
  } catch (error) {
    log.error(`Error de conexión: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n' + colors.blue + '═══════════════════════════════════════════' + colors.reset);
  console.log(colors.blue + '  TerraControl - Inicialización de BD' + colors.reset);
  console.log(colors.blue + '═══════════════════════════════════════════' + colors.reset + '\n');

  try {
    // 1. Verificar conexión
    const connected = await verifyConnection();
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // 2. Ejecutar migraciones
    log.info('Paso 1/2: Migraciones');
    const migrationsOk = await runMigrations();
    if (!migrationsOk) {
      throw new Error('Las migraciones fallaron');
    }

    // 3. Ejecutar seeders
    log.info('Paso 2/2: Seeders');
    const seedersOk = await runSeeders();
    if (!seedersOk) {
      throw new Error('Los seeders fallaron');
    }

    console.log('\n' + colors.green + '═══════════════════════════════════════════' + colors.reset);
    console.log(colors.green + '  ✓ Base de datos inicializada correctamente' + colors.reset);
    console.log(colors.green + '═══════════════════════════════════════════' + colors.reset + '\n');

    process.exit(0);
  } catch (error) {
    console.log('\n' + colors.red + '═══════════════════════════════════════════' + colors.reset);
    console.log(colors.red + `  ✗ Error: ${error.message}` + colors.reset);
    console.log(colors.red + '═══════════════════════════════════════════' + colors.reset + '\n');

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
