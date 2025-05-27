// Cấu hình chỉ mục tìm kiếm MongoDB Atlas
// Sử dụng file này để tham khảo khi tạo chỉ mục qua giao diện MongoDB Atlas hoặc MongoDB Compass

const searchIndexConfig = {
  "name": "product_search_index",
  "definition": {
    "mappings": {
      "dynamic": false,
      "fields": {
        "title": {
          "type": "string",
          "analyzer": "lucene.standard",
          "searchAnalyzer": "lucene.standard",
          "similarity": {
            "type": "boolean"
          }
        },
        "description": {
          "type": "string",
          "analyzer": "lucene.standard",
          "searchAnalyzer": "lucene.standard"
        },
        "color": {
          "type": "string",
          "analyzer": "lucene.standard"
        },
        "price": {
          "type": "number"
        },
        "brand": {
          "type": "document",
          "fields": {
            "name": {
              "type": "string",
              "analyzer": "lucene.standard"
            }
          }
        },
        "category": {
          "type": "document",
          "fields": {
            "name": {
              "type": "string",
              "analyzer": "lucene.standard"
            }
          }
        }
      }
    }
  }
};

module.exports = searchIndexConfig;

/*
HƯỚNG DẪN TẠO CHỈ MỤC:

1. Đăng nhập vào MongoDB Atlas: https://cloud.mongodb.com
2. Chọn cluster của bạn
3. Vào mục "Search" trong menu bên trái
4. Nhấn "Create Search Index"
5. Chọn "JSON Editor"
6. Nhập cấu hình index như trên (chỉ phần "mappings" trở xuống)
7. Chọn database và collection sản phẩm của bạn
8. Đặt tên index là "product_search_index"
9. Xác nhận và tạo index

Lưu ý: Cần đảm bảo trường brand và category đã được populate để index hoạt động tốt
*/ 