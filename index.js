//DEVELOPPEMENT ONLY
require('dotenv').config()

const express = require('express')
const sources = require('./sources.json')
const Parser = require('rss-parser')
const {v4} = require('uuid')
const {writeFileSync} = require('fs')

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// TODO: liste des sources et pastille dessus avec le nombre de nouveaux post non lu

app.get('/', (req, res) => {
    let srcs = []

    sources.forEach((elem) => {
        srcs.push(elem)
    })
    res.status(200).json({sources: srcs})
})

app.get('/sources', async (req, res) => {
    let data = []
    
    for (const src of sources) {
        const parser = new Parser()
        const feed = await parser.parseURL(src.url)

        data.push({name: src.name, data: feed.items})
    }
    res.json(data)
})

app.get('/source/:sourceId', async (req, res) => {
    let sourceId = req.params.sourceId
    let src = sources.find(elem => elem.id === sourceId)

    const parser = new Parser()
    const feed = await parser.parseURL(src.url)

    res.json(feed.items)
})

app.post('/source', (req, res) => {
    console.log(req.body)
    sources.push({
        id: v4(),
        name: req.body.name,
        url: req.body.url,
        lastRead: ""
    })
    try {
        writeFileSync('./sources.json', JSON.stringify(sources))
        res.status(200).json({res: "The source was add"})
    } catch (e) {
        res.status(500).json({error: e})
    }
})

app.listen(port, () => console.log(`App running on :${port}`))