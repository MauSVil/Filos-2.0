#!/usr/bin/env node
/**
 * Script de consulta de resultados desde MongoDB
 *
 * Uso:
 * npx tsx scripts/trends/query-results.ts [opciones]
 *
 * Opciones:
 * --date YYYY-MM-DD    Ver resultados de una fecha específica
 * --latest             Ver el último análisis
 * --list               Listar todos los análisis disponibles
 * --stats              Ver estadísticas generales
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();

async function queryResults() {
  console.log('\n' + '═'.repeat(80));
  console.log('📊 CONSULTA DE RESULTADOS DE TENDENCIAS');
  console.log('═'.repeat(80) + '\n');

  // Verificar MongoDB URI
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Error: MONGODB_URI no está configurado');
    console.error('💡 Uso: MONGODB_URI=xxx bun query-results.ts\n');
    process.exit(1);
  }

  // Parsear argumentos
  const args = process.argv.slice(2);
  const dateArg = args.includes('--date') ? args[args.indexOf('--date') + 1] : null;
  const list = args.includes('--list');
  const stats = args.includes('--stats');

  // Conectar a MongoDB
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db('test');
    const collection = db.collection('trends_results');

    // --list: Listar todos los análisis
    if (list) {
      console.log('📋 ANÁLISIS DISPONIBLES:\n');
      const documents = await collection
        .find({}, {
          projection: {
            date: 1,
            timestamp: 1,
            'imageStats.totalImagesFound': 1,
            _id: 0
          }
        })
        .sort({ date: -1 })
        .toArray();

      if (documents.length === 0) {
        console.log('   No hay análisis disponibles\n');
      } else {
        documents.forEach((doc, i) => {
          console.log(`   ${i + 1}. ${doc.date}`);
          console.log(`      ├─ Timestamp: ${doc.timestamp}`);
          console.log(`      └─ Imágenes: ${doc.imageStats?.totalImagesFound || 0}\n`);
        });
      }
    }

    // --stats: Estadísticas generales
    else if (stats) {
      console.log('📈 ESTADÍSTICAS GENERALES:\n');

      const totalDocs = await collection.countDocuments();
      console.log(`   Total de análisis: ${totalDocs}`);

      if (totalDocs > 0) {
        const firstDoc = await collection.findOne({}, { sort: { date: 1 } });
        const lastDoc = await collection.findOne({}, { sort: { date: -1 } });

        console.log(`   Primer análisis: ${firstDoc?.date}`);
        console.log(`   Último análisis: ${lastDoc?.date}`);

        const pipeline = [
          {
            $group: {
              _id: null,
              totalImages: { $sum: '$imageStats.totalImagesFound' },
              avgImages: { $avg: '$imageStats.totalImagesFound' },
              totalTerms: { $sum: '$imageStats.totalTermsSearched' }
            }
          }
        ];

        const aggregation = await collection.aggregate(pipeline).toArray();
        if (aggregation.length > 0) {
          const agg = aggregation[0];
          console.log(`   Total de imágenes recolectadas: ${agg.totalImages}`);
          console.log(`   Promedio de imágenes por análisis: ${Math.round(agg.avgImages)}`);
          console.log(`   Total de términos analizados: ${agg.totalTerms}`);
        }

        console.log('');
      } else {
        console.log('   No hay datos suficientes para estadísticas\n');
      }
    }

    // --date YYYY-MM-DD: Ver análisis específico
    else if (dateArg) {
      console.log(`🔍 ANÁLISIS DEL ${dateArg}:\n`);

      const doc = await collection.findOne({ date: dateArg });

      if (!doc) {
        console.log(`   No se encontró análisis para la fecha ${dateArg}\n`);
      } else {
        console.log(`📊 Estadísticas de Imágenes:`);
        console.log(`   ├─ Términos buscados: ${doc.imageStats.totalTermsSearched}`);
        console.log(`   ├─ Imágenes encontradas: ${doc.imageStats.totalImagesFound}`);
        console.log(`   ├─ Términos con imágenes: ${doc.imageStats.termsWithImages}`);
        console.log(`   └─ Términos sin imágenes: ${doc.imageStats.termsWithoutImages}\n`);

        console.log(`🎯 Top 10 Términos con Imágenes:\n`);
        doc.topTermsWithImages.slice(0, 10).forEach((term: any, i: number) => {
          const emoji = term.type === 'rising' ? '🚀' : '📊';
          console.log(`   ${emoji} ${i + 1}. "${term.query}"`);
          console.log(`      ├─ Interés: ${term.value}/100`);
          console.log(`      └─ Imágenes: ${term.images.length}`);
        });

        if (doc.trendingSearches && doc.trendingSearches.length > 0) {
          console.log(`\n🔥 Trending Searches:\n`);
          doc.trendingSearches.forEach((trend: any, i: number) => {
            console.log(`   ${i + 1}. "${trend.query}"`);
            console.log(`      └─ Volumen: ${trend.searchVolume}\n`);
          });
        }

        console.log(`\n📈 Related Queries:`);
        console.log(`   ├─ Top: ${doc.relatedQueries.top.length} términos`);
        console.log(`   └─ Rising: ${doc.relatedQueries.rising.length} términos\n`);

        console.log(`⏰ Generado: ${doc.timestamp}\n`);
      }
    }

    // --latest o sin argumentos: Ver último análisis
    else {
      console.log('🆕 ÚLTIMO ANÁLISIS:\n');

      const doc = await collection.findOne({}, { sort: { date: -1 } });

      if (!doc) {
        console.log('   No hay análisis disponibles\n');
      } else {
        console.log(`📅 Fecha: ${doc.date}`);
        console.log(`⏰ Timestamp: ${doc.timestamp}\n`);

        console.log(`📊 Estadísticas:`);
        console.log(`   ├─ Términos analizados: ${doc.imageStats.totalTermsSearched}`);
        console.log(`   ├─ Imágenes encontradas: ${doc.imageStats.totalImagesFound}`);
        console.log(`   ├─ Términos con imágenes: ${doc.imageStats.termsWithImages}`);
        console.log(`   └─ Términos sin imágenes: ${doc.imageStats.termsWithoutImages}\n`);

        console.log(`🎯 Top 5 Términos:\n`);
        doc.topTermsWithImages.slice(0, 5).forEach((term: any, i: number) => {
          const emoji = term.type === 'rising' ? '🚀' : '📊';
          const typeLabel = term.type === 'rising' ? 'EMERGENTE' : 'ALTA DEMANDA';
          console.log(`   ${emoji} ${i + 1}. "${term.query}" [${typeLabel}]`);
          console.log(`      ├─ Interés: ${term.value}/100`);
          console.log(`      └─ Imágenes: ${term.images.length}\n`);
        });

        console.log(`💡 Para ver más detalles: bun query-results.ts --date ${doc.date}\n`);
      }
    }

    console.log('═'.repeat(80));
    console.log('✅ CONSULTA COMPLETADA');
    console.log('═'.repeat(80) + '\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Verifica tu MONGODB_URI y conexión\n');
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Si no hay argumentos, mostrar ayuda
if (process.argv.length === 2 || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
📊 Query Results - Consulta de resultados de tendencias

Uso:
  npx tsx scripts/trends/query-results.ts [opciones]

Opciones:
  --latest             Ver el último análisis (default)
  --date YYYY-MM-DD    Ver resultados de una fecha específica
  --list               Listar todos los análisis disponibles
  --stats              Ver estadísticas generales
  --help, -h           Mostrar esta ayuda

Ejemplos:
  npx tsx scripts/trends/query-results.ts
  npx tsx scripts/trends/query-results.ts --latest
  npx tsx scripts/trends/query-results.ts --date 2025-10-16
  npx tsx scripts/trends/query-results.ts --list
  npx tsx scripts/trends/query-results.ts --stats
`);
  process.exit(0);
}

queryResults();
