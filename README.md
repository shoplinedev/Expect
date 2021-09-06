# Shopline Theme : {{ name }}

## 安装依赖
```sh
yarn
```
or
```sh
npm install
```

## 在主题内新增 .env 文件，输入以下内容

```bash
# 是否使用线上 api 数据
ENABLE_API_DATA=false
# 店铺域名，自行切换
MOCK_STORE_HOST=hacken3.myshoplinedev.com
# 后端 API
BACKEND_API=fp-store-in.myshoplinedev.com

# 运行环境
APP_ENV=develop
```

## 启动服务
```sh
yarn serve
```

## 打包 zip 包
```sh
yarn zip
```
> 这个命令只会压缩 assets config layout locales sections snippets templates 这几个目录

用打包后的 .zip 包到B端上传