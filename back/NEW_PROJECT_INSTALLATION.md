## Node Modules installation

When you create project for first time and you want to have latest version of `node_modules`, delete `dependencies` and `devDependencies` block in `package.json`.

After that, launch following commands.

### Dependencies

```sh
npm install --save async boom fs-extra good good-console hapi hoek joi node-config-manager require-directory hapi-mongo-models joi-objectid mongodb kerberos
```

### Development Dependencies

```sh
npm install --save-dev chalk code del gulp gulp-filter gulp-jshint gulp-jsonminify gulp-load-plugins gulp-nodemon gulp-size gulp-uglify jshint jshint-stylish lab require-dir uglify-save-license gulp-lab sinon gulp-babel babel-preset-es2015
```

## Conclusion

These packages are the minimal required to execute the project.

You can install after that all needed packages in `dependencies` or `devDependencies` to perform your project.