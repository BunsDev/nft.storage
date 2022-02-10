import AWS from 'aws-sdk'
import Converter from 'aws-sdk/lib/dynamodb/converter.js'

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const sqs = new AWS.SQS()

export async function store(event) {
  const records = event.Records.map((x) => JSON.parse(x.body))

  let tableBatch = []
  for (const record of records) {
    const result = dynamoDb
      .put({
        TableName: process.env.fetchedRecordsTableName,
        Item: {
          ...record,
          created_at: Date.now(),
        },
      })
      .promise()
    tableBatch.push(result)
  }

  try {
    await Promise.all(tableBatch)
  } catch (err) {
    return {
      statusCode: 500,
      message: `ERROR: ${err}`,
    }
  }

  return {
    statusCode: 200,
    message: `Stored ${records.length} Fetched Record`,
  }
}
