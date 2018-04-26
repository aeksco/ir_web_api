const Restaurant = require('./restaurant.model')

// Defines the attributes returned when searching
const searchResultAttrs = ['_id', 'facility', 'operation_name', 'corp_name', 'address.city', 'address.zipcode']

// // // //

// Defines default pagination options
function handlePagination (req) {
    let page = Number(req.query.page) || 1;
    page = Math.max(page - 1, 0)
    let per_page = Number(req.query.per_page) || 10;
    let skip = per_page * page;
    return { page, per_page, skip }
}

// // // //

// GET /restaurants
module.exports.list = (req, res, next) => {

    let query = {}
    let { page, per_page, skip } = handlePagination(req)

    // Queries and Paginates
    return Restaurant.find(query, searchResultAttrs)
      .sort({ operation_name: 1 })
      .limit(per_page)
      .skip(skip)
      .lean()
      .exec()
      .then((response) => {
        return res
        .status(200)
        .json({
          page: page + 1,
          per_page: per_page,
          items: response
        })
        .end();
      })
      .catch((err) => {
        handleError(res, err)
      })
};

// // // //

// GET /restaurants/search
module.exports.search = (req, res, next) => {

    // Handles user queries
    let query = {}
    let { page, per_page, skip } = handlePagination(req)
    let searchQuery = req.query.q

    // Regex matching for text search
    let matchQuery = [
        { facility: new RegExp(searchQuery, 'i') },
        { operation_name: new RegExp(searchQuery, 'i') },
        { corp_name: new RegExp(searchQuery, 'i') }
    ]

    // Builds query
    if (req.query.city) {
        query['$and'] = [
            { '$or': matchQuery },
            { 'address.city': req.query.city }
        ]
    } else {
        query['$and'] = [
            { '$or': matchQuery }
        ]
    }

    // Queries and Paginates
    return Restaurant.find(query, searchResultAttrs)
      .sort({ operation_name: 1 })
      .limit(per_page)
      .skip(skip)
      .lean()
      .exec()
      .then((response) => {
        return res
        .status(200)
        .json({
          page: page + 1,
          per_page: per_page,
          items: response
        })
        .end();
      })
      .catch((err) => {
        handleError(res, err)
      })
};

// // // //

// GET /restaurants/:id
module.exports.show = (req, res, next) => {
    return Restaurant.findOne({ _id: req.params.id })
    .then((response) => {
        return res
        .status(200)
        .send(response)
        .end();
    }).catch(next);
};

// // // //
