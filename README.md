# 测试模板主题

## 安装
```sh
yarn global add @yy/sl-theme-cli
# or
npm install -g @yy/sl-theme-cli
```

## 创建初始化模板
```sh
sl-theme init <name>
```

## 本地开发
```sh
cd 创建的目录
```
```sh
# 安装依赖
yarn
```
```sh
# 启动服务
yarn serve
```

## 打包 zip 包
```sh
yarn zip
```
> 这个命令只会压缩 assets config layout locales sections snippets templates 这几个目录

用打包后的 .zip 包到B端上传