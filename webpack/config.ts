import Logger from "@theadmasters/logger"
import VersionManager from "@theadmasters/version-manager"

import path from "path"
import webpack from "webpack"

import TerserJSPlugin from "terser-webpack-plugin"
import NodemonPlugin from "nodemon-webpack-plugin"

const { CONFIG, MODE } = process.env

const logger = new Logger("Webpack config")
const versionManager = new VersionManager(undefined, MODE)

console.log("\n\n")
logger.info("Welcome to the *awesome typescript webpack* config! :)")
switch (CONFIG) {
	case "development":
		logger.info("Running *development server*...*")
		break
	case "production":
		logger.info(`Building new *${MODE} version*...`)
		break
	default:
		logger.error(`Wrong *CONFIG* env variable value. Expected values: *development, production*, got *${CONFIG || "nothing"}*`)
		process.exit(1)
}
console.log("\n\n")

if (CONFIG == "production")
	versionManager.increaseVersion()

const sassLoader: webpack.Loader = {
	loader: "sass-loader",
	options: {
		sassOptions: {
			includePaths: [
				path.resolve(__dirname, "../src")
			]
		}
	}
}

const defaultRules: webpack.RuleSetRule[] = [
	{
		test: /\.tsx?$/,
		loader: "ts-loader",
		exclude: /node_modules/,
	},
	{
		enforce: "pre",
		test: /\.js$/,
		loader: "source-map-loader"
	},
]

const defaultConfig: webpack.Configuration = {
	resolve: {
		modules: [
			"node_modules",
			path.resolve(__dirname, "../src"),
		],
		extensions: [".js", ".ts"]
	},
	performance: {
		hints: "warning",
	},
	parallelism: 12,
}

const devConfig: webpack.Configuration = {
	...defaultConfig,
	mode: "development",
	watch: true,
	entry: {
		app: path.resolve(__dirname, "../src/index.ts")
	},
	output: {
		path: __dirname,
		filename: "dist/bundle.js",
		publicPath: "/"
	},
	devtool: "eval-source-map",
	module: {
		rules: [
			...defaultRules,
			{
				test: /\.(sa|c)ss$/,
				use: [
					"style-loader",
					"css-loader",
					sassLoader
				]
			}
		]
	},
	plugins: [
		new NodemonPlugin()
	]
}

const prodConfig: webpack.Configuration = {
	...defaultConfig,
	mode: "production",
	entry: {
		app: path.resolve(__dirname, "../src/index.tsx")
	},
	output: {
		path: path.resolve(__dirname, `../dist/${versionManager.version}`),
		filename: `bundle.js`,
		publicPath: `/assets/${versionManager.version}`
	},
	module: {
		rules: [
			...defaultRules,
		]
	},
	optimization: {
		minimizer: [
			new TerserJSPlugin({}),
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			"process.env.HOST": "window.location.origin",
			"process.env.VERSION": JSON.stringify(versionManager.version),
			"process.env.NODE_ENV": JSON.stringify("production")
		}),
	]
}

const envConfigs = {
	development: devConfig,
	production: prodConfig
}

export default envConfigs[CONFIG]