# 调试插件

把本地node模块link到全局目录：

```
$ npm link
或 sudo npm link

# 开启whistle的调试模式
$ w2 run
```

这样whistle会自动加载改插件，如果插件有代码更新，需要触发修改package.json这个文件，比如加个空格，或者直接加个字段，每次修改下这个字段，whistle会检查package.json是否有更改，如果更改的话会自动重启。

卸载本地插件：

```
npm unlink
# 或 sudo npm unlink

# 如果npm link不是在模块所在根目录执行，可以采用下面这种方式卸载本地开发的全局模块
npm unlink whistle.xxx -g
# 或 sudo npm unlink whistle.xxx -g
```

安装插件

同安装全局的node模块，只需直接通过npm安装，需要安装到全局

```
npm install -g whistle.protocol
# 或
xnpm install -g whistle.protocol
# 或
xnpm install -g @org/whistle.protocol
```