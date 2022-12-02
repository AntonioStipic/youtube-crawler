const express = require('express');
const {db} = require("./utils/db");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
const PORT = 3030;

const app = express();

app.use(express.json());

app.listen(PORT, () => {

    console.log(`Listening on port: ${PORT}`);
});


app.get('/', (request, response) => {
    response.json({
        message: `ok`
    });
});
/*
        channel_id,
        channel_url,
        channel_name,
        num_of_channel_views,
        subscriber_count,
        created_on,
        description,
        links,
        details
 */
app.get('/search', async (request, response) => {
    const channel_name  = request.query.channel_name;
    const min_views_value  = request.query.min_views_value;
    const max_views_value  = request.query.max_views_value;
    const min_subs_value  = request.query.min_subs_value;
    const max_subs_value  = request.query.max_subs_value;
    const min_created_on  = request.query.min_created_on;
    const max_created_on  = request.query.max_created_on;
    const category  = request.query.category;
    const country  = request.query.country;
    const order_by  = request.query.order_by;
    const page_size = 10;
    const page = request.query.page || 0;

    const filters = [];

    if (min_views_value) {
        filters.push({
            field: 'num_of_channel_views',
            operator: '>',
            value: min_views_value
        });
    }

    if (max_views_value) {
        filters.push({
            field: 'num_of_channel_views',
            operator: '<',
            value: max_views_value
        });
    }

    if (min_subs_value) {
        filters.push({
            field: 'subscriber_count',
            operator: '>',
            value: min_subs_value
        });
    }

    if (max_subs_value) {
        filters.push({
            field: 'subscriber_count',
            operator: '<',
            value: max_subs_value
        });
    }

    if (min_created_on) {
        filters.push({
            field: 'created_on',
            operator: '>',
            value: min_created_on
        });
    }

    if (max_created_on) {
        filters.push({
            field: 'created_on',
            operator: '<',
            value: max_created_on
        });
    }

    if(category){
        filters.push({
            field: 'category',
            operator: '=',
            value: category
        });
    }

    if(country){
        filters.push({
            field: 'details',
            operator: '=',
            value: country
        })
    }
    if(channel_name){
        filters.push({
            field: 'channel_name',
            operator: 'LIKE',
            value: '%' + channel_name + '%'
        })
    }

    let query = db.select('*')
        .from('channels')
        .offset(page * page_size)
        .limit(page_size)
        .orderBy(order_by?.field || 'created_on', order_by?.order || 'desc');

    for (const filter of filters) {
        query = query.andWhere(filter.field, filter.operator, filter.value);

    }


    console.log(query.toSQL());


    const result = await query.catch((error) => {
        console.log(`Error while searching`, error);

    });


    response.json({
        data: result,
        page,
        page_size
    });
});


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
