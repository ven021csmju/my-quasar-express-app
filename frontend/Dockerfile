# ใช้ Nginx สำหรับเสิร์ฟไฟล์ static
FROM nginx:alpine

# ลบค่า default ของ nginx ออก
RUN rm -rf /usr/share/nginx/html/*

# คัดลอกไฟล์ทั้งหมดจากโปรเจคไปไว้ใน html (จะรวม longan_map.html ด้วย)
COPY ./src/pages/ /usr/share/nginx/html/

# คัดลอก config ของ nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
