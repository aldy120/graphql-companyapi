var restApiUrl = 'http://54.199.222.132'
// This is an example MongoDB pad

var { graphql, buildSchema } = require('graphql');
var { MongoClient, ObjectID } = require('mongodb');
var fetch = require('node-fetch');

module.exports.schema = buildSchema(
`
# The query type, represents all of the entry points into our object graph
type Query {
	# Get comapnies with some filter parameters
	# 取得符合查詢條件的公司
	companies(
		# The string to match in company name (or some other fields - information, service, welfare, philosophy - if fuzzy is true)
		# 搜尋公司名含有此字串的公司(fuzzy模式則包含另外四個一起搜尋，分別是公司資訊、服務項目、公司福利、經營理念)
		queryString: String,
		# Fuzzy mode will open if true (default false), see companies for details
		# 若為 true 則開啟糢糊模式，詳見 companies
		fuzzy: Boolean = false,
		# Slice the result from the begin
		begin: Int,
		# Slice the result from the end
		end: Int,
		# Filter string for area
		area: [String],
		# Filter string for industry
		industry: [String],
		# The lower bound for number of employees
		employeeLowerBound: Int,
		# The upper bound for number of employees
		employeeUpperBound: Int,
		# The lower bound for amount of capital
		capitalLowerBound: Int,
		# The upper bound for amount of capital
		capitalUpperBound: Int,
		# Filter string for information
		information: String,
		# Filter string for service
		service: String,
		# Filter string for welfare
		welfare: String,
		# Filter string for philosophy
		philosophy: String
	): [Company]
	# Find a company by company id
	companyById(id: ID!): Company
	# Find all tags from a company by company id
	tagsByCompanyId(id: ID!): [Tag]
	# List all tags
	tags: [Tag]
	# Find all companies in a tag by tag id
	companiesByTagId(id: ID!): [Company]
}

type Mutation {
	# Add a company data to database
	createCompany(input: CompanyInput): Company
	# Update (not totally override) a company data to database 
	updateCompany(id: ID!, input: CompanyInput): Company
	# Delete a company by company id
	deleteCompany(id: ID!): Company
	# Add a tag to a company
	createTagByCompanyId(id: ID!, tagName: String!): Tag 
	# Remove a tag from a company
	removeTagFromCompany(companyId: ID!, tagId: ID!) : Company
}

input CompanyInput {
	# Company name
	name: String
	# Company profile
	profile: CompanyProfileInput
	# 公司資訊
	information: String
	# 公司服務
	service: String
	# 公司福利
	welfare: String
	# 經營理念
	philosophy: String
	# Logo image url
	logoUrl: String
	# Environment image
	environment: [ImageInput]
}

input ImageInput {
	# image url
	url: String
	# image description
	description: String
}

input CompanyProfileInput {
	# 產業
	industry: String
	# 分類
	category: String
	# 員工數
	employee: Int
	# 資本額
	capital: Int
	# 聯絡人
	contact: String
	# 地址
	address: String
	# 電話
	phone: String
	# 傳真
	fax: String
	# 網站
	website: String
	# 連結
	link: String
}

type Company {
	_id: ID
	# 公司名稱
	name: String
	# 公司介紹
	profile: CompanyProfile
	# 公司資訊
	information: String
	# 公司服務
	service: String
	# 公司福利
	welfare: String
	# 經營理念
	philosophy: String
	# Logo 圖片
	logoUrl: String
	# 環境照片
	environment: [Image]
	# 標籤(字串儲存)
	tags: [String]
	# 標籤(物件儲存)
	tagList: [Tag]
	# 大圖網址
	imageUrl: String
}

type Image {
	# 圖片位址
	url: String
	description: String
}

type CompanyProfile {
	# 公司產業
	industry: String
	# 公司分類
	category: String
	# 員工數
	employee: Int
	# 資本額
	capital: Int
	# 聯絡人
	contact: String
	# 地址
	address: String
	# 電話
	phone: String
	# 傳真
	fax: String
	# 網站
	website: String
	# 連結
	link: String
}

type Tag {
	_id: ID!
	# 標籤名稱
	name: String
	# 公司列表
	companyList: [Company]
	createTime: String
	updateTime: String
}
`
);

class Tag {
	constructor({_id, name}) {
		this._id = _id;
		this.name = name;
	}
	companyList() {
		return fetch(`${restApiUrl}/company/tag/${this._id}`)
			.then(res => res.json())
	}
}


class Company {
	constructor(company) {
		for (var prop in company) {
			this[prop] = company[prop];
		}
	}
	tagList() {
		if (!this.tags) return [];
		return this.tags.map(tagId => {
			return fetch(`${restApiUrl}/tag/${tagId}`)
				.then(res => res.json())
				.then(({_id, name}) => {
					return new Tag({_id, name});
				})
		});
	}
}

// The root provides a resolver function for each API endpoint
module.exports.rootValue = {
//   posts: async (args, context) => {
//     return context.mongo.collection('Posts').find({}).map(fromMongo).toArray();
//   },

//   postById: async ({ id }, context) => {
//     const result = await context.mongo
//       .collection('Posts')
//       .findOne({ _id: new ObjectID(id) });
//     return fromMongo(result);
//   },
	
	
  tagsByCompanyId: ({id}) => {
		return fetch(`${restApiUrl}/company/${id}/tag`)
			.then(res => res.json());
	},
  
  tags: () => {
		return fetch(`${restApiUrl}/company/tag`)
			.then(res => res.json())
			.then(tags => tags.map(tag => new Tag(tag)))
	},

	companiesByTagId: ({id}) => {
		return fetch(`${restApiUrl}/company/tag/${id}`)
			.then(res => res.json())
	},

	companies: (args) => {
		return fetch(`${restApiUrl}/company/filter`, {
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify(args)
		}).then(res => res.json())
			.then(companies => companies.map(company => new Company(company)))
	},

	companyById: ({id}) => {
		return fetch(`${restApiUrl}/company/${id}`)
			.then(res => res.json());
	},

	createCompany: ({input}) => {
		return fetch(`${restApiUrl}/company`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(input)
		}).then(res => res.json());
	},

	updateCompany: ({id, input}) => {
		return fetch(`${restApiUrl}/company/${id}`, {
			method: 'PUT',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify(input)
		}).then(res => res.json());
	},

	deleteCompany: ({id}) => {
		return fetch(`${restApiUrl}/company/${id}`,{
			method: 'DELETE'
		}).then(res => res.json());
	},

	createTagByCompanyId: ({id, tagName}) => {
		return fetch(`${restApiUrl}/company/${id}/tag`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				tagName: tagName
			})
		}).then(res => res.json())
			.then(({add: {_id, tagName}}) => {
				return new Tag({
					_id, 
					name: tagName
				});
			})
	},

	removeTagFromCompany: ({companyId, tagId}) => {
		return fetch(`${restApiUrl}/company/${companyId}/tag/${tagId}`, {
			method: 'DELETE',
		}).then(res => res.json());
	}
};


// let mongo;

module.exports.context = async function (headers, secrets) {
  // if (!mongo) {
  //   mongo = await MongoClient.connect(secrets.MONGODB_URL)
  // }
  // return {
  //   mongo,
  // };
}

