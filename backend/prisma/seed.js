"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const ensure_master_user_1 = require("../src/bootstrap/ensure-master-user");
const prisma = new client_1.PrismaClient();
async function main() {
    await (0, ensure_master_user_1.upsertMasterUser)(prisma);
    const stakesData = [
        {
            name: 'Estaca Centro',
            wards: ['Barrio Libertad', 'Barrio San José', 'Barrio El Carmen'],
        },
        {
            name: 'Estaca Norte',
            wards: ['Barrio Los Olivos', 'Barrio La Paz', 'Barrio Vista Hermosa'],
        },
        {
            name: 'Estaca Sur',
            wards: ['Barrio Santa Rosa', 'Barrio Las Flores', 'Barrio El Prado'],
        },
        {
            name: 'Estaca Oriente',
            wards: ['Barrio Nueva Esperanza', 'Barrio Los Pinos', 'Barrio San Miguel'],
        },
    ];
    for (const stakeData of stakesData) {
        const stake = await prisma.stake.upsert({
            where: { name: stakeData.name },
            update: {},
            create: { name: stakeData.name },
        });
        for (const wardName of stakeData.wards) {
            await prisma.ward.upsert({
                where: { name_stakeId: { name: wardName, stakeId: stake.id } },
                update: {},
                create: { name: wardName, stakeId: stake.id },
            });
        }
    }
    const fieldDefs = [
        { name: 'ex_misionero', label: 'Ex Misionero', required: false },
        { name: 'primera_vez', label: 'Primera vez asistiendo', required: false },
        { name: 'instituto', label: 'Participa en Instituto', required: false },
        { name: 'recomendacion', label: 'Tiene recomendación vigente', required: false },
    ];
    for (const field of fieldDefs) {
        await prisma.fieldDefinition.upsert({
            where: { name: field.name },
            update: { label: field.label },
            create: {
                name: field.name,
                label: field.label,
                type: 'CHECKBOX',
                required: field.required,
                active: true,
            },
        });
    }
    console.log('Seed completed successfully');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map