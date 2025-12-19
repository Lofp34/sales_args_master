const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Create Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { email: 'ls@laurentserre.com' },
        update: {},
        create: {
            email: 'ls@laurentserre.com',
            name: 'Laurent Serre',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
        },
    })

    console.log('Super Admin created:', superAdmin.email)

    // Initial Arguments
    const initialArguments = [
        {
            title: 'Mobilité & Accès Full Web',
            impact: 'Transforme la contrainte technique en liberté personnelle (domicile, vacances, urgences).',
            maieutique: 'Dans quelles situations vous est-il déjà arrivé de devoir gérer une urgence ou une réservation alors que vous n\'étiez pas physiquement à l\'accueil ?',
            status: 'APPROVED',
            userId: superAdmin.id,
        },
        {
            title: 'La Vente par la Projection (Gestion des Galères)',
            impact: 'On ne vend pas un logiciel, on vend la sérénité face aux imprévus (retards, groupes).',
            maieutique: 'Comment gérez-vous aujourd\'hui l\'arrivée imprévue d\'un groupe en retard lorsque votre équipe d\'accueil a déjà terminé son service ?',
            status: 'APPROVED',
            userId: superAdmin.id,
        },
        {
            title: 'Sécurisation Budgétaire (Closing)',
            impact: 'Signer maintenant fige les conditions tarifaires et protège contre l\'inflation, indépendamment de la date de déploiement.',
            maieutique: 'Si nous validons l\'accord aujourd\'hui pour bloquer ces tarifs, en quoi cela faciliterait-il votre planification budgétaire pour l\'année prochaine ?',
            status: 'APPROVED',
            userId: superAdmin.id,
        },
        {
            title: 'L\'effet "Wow" & Fluidité Logicielle',
            impact: 'Une interface moderne rassure sur la pérennité de l\'outil et simplifie l\'adoption par les équipes saisonnières.',
            maieutique: 'Quelle image renvoie votre outil actuel à vos nouveaux collaborateurs lorsqu\'ils arrivent pour la saison ?',
            status: 'APPROVED',
            userId: superAdmin.id,
        },
        {
            title: 'Gestion "Panier" & Facturation Flexible',
            impact: 'Supprime les frustrations liées aux dossiers complexes (amis, familles) et fluidifie le passage en caisse.',
            maieutique: 'Comment gérez-vous aujourd\'hui le cas de deux couples d\'amis qui souhaitent payer séparément mais sont sur le même séjour ?',
            status: 'APPROVED',
            userId: superAdmin.id,
        },
        {
            title: 'Upsell Automatisé (Guest Portal)',
            impact: 'Génère du chiffre d\'affaires additionnel sans solliciter le personnel de réception.',
            maieutique: 'Aujourd\'hui, que se passe-t-il si un client souhaite rajouter une option (barbecue, ménage) à 22h, la veille de son arrivée ?',
            status: 'APPROVED',
            userId: superAdmin.id,
        },
    ]

    for (const arg of initialArguments) {
        await prisma.argument.create({
            data: arg,
        })
    }

    console.log('Initial arguments seeded')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
