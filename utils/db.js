const knex = require('knex');

const pool = knex({
    client: 'pg',
    connection: {
        host: '192.168.100.201',
        port: 5432,
        user: 'postgres',
        database: 'youtube-crawler',
        password: 'samoperojs'
    }
});



async function main() {
    const channels = await pool.schema.hasTable('channels');
    if (!channels) {
        await pool.schema.createTable('channels', (table) => {
            table.string('channel_id', 2048).primary();
            table.string('channel_url', 2048).notNullable();
            table.string('channel_name', 2048);
            table.bigInteger('num_of_channel_views');
            table.bigInteger('subscriber_count');
            table.timestamp('created_on');
            table.string('description', 2048);
            table.string('links', 2048);
            table.string('details', 2048);
            table.string('category', 2048);
            table.string('channel_number_of_videos', 2048);
        });
    }
    const channels_queue = await pool.schema.hasTable('channels_queue');
    if (!channels_queue) {
        await pool.schema.createTable('channels_queue', (table) => {
            table.string('channel_id', 2048).primary();
            table.string('channel_url', 2048).notNullable();
            table.bigInteger('channel_number_of_videos');
            table.string('status', 12);
        });
    }

    const channels_statistics = await pool.schema.hasTable('channels_statistics');
    if (!channels_statistics) {
        await pool.schema.createTable('channels_statistics', (table) => {
            table.string('id', 64).primary();
            table.string('channel_id', 2048).notNullable();
            table.bigInteger('num_of_channel_views');
            table.bigInteger('subscriber_count');
            table.timestamp('created_on');
        });
    }

}

main().catch((error) => {
    console.log('Error', error);
    process.exit(1);
});

exports.db = pool;
