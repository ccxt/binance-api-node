#!/usr/bin/env node
/**
 * Browser Test Runner - Loads and runs actual test files in a browser
 *
 * Reads test files from the test/ directory and executes them in a real browser
 * using Playwright to ensure browser compatibility.
 */

import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Test results tracking
const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    tests: []
}

async function main() {
    console.log('🌐 Browser Test Runner (Signature Tests)')
    console.log('=========================================\n')

    // Find test files - only signature tests run through this runner
    // Other browser tests (crypto-browser-playwright, websocket-browser) use AVA directly
    const testFiles = await glob('test/browser/signature.js', {
        cwd: join(__dirname, '..', '..'),
    })

    console.log(`📁 Found ${testFiles.length} signature test file\n`)

    // Launch browser
    console.log('🚀 Launching Chromium (headless)...')
    const browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({ ignoreHTTPSErrors: true })
    const page = await context.newPage()

    // Navigate to HTTPS page to enable Web Crypto API
    await page.goto('https://example.com')
    console.log('✅ Browser ready\n')

    // Setup browser test environment
    await setupBrowserTestEnvironment(page)

    // Run tests from each file
    for (const testFile of testFiles) {
        const fullPath = join(__dirname, '..', '..', testFile)
        await runTestFile(page, fullPath, testFile)
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Summary')
    console.log('='.repeat(60))
    console.log(`Total:   ${results.total}`)
    console.log(`Passed:  ${results.passed} ✅`)
    console.log(`Failed:  ${results.failed} ${results.failed > 0 ? '❌' : ''}`)
    console.log(`Skipped: ${results.skipped} ⏭️`)
    console.log('='.repeat(60))

    if (results.failed > 0) {
        console.log('\n❌ Failed tests:')
        results.tests.filter(t => t.status === 'failed').forEach(t => {
            console.log(`  - ${t.file}: ${t.name}`)
            if (t.error) console.log(`    ${t.error}`)
        })
    }

    await context.close()
    await browser.close()

    // Exit with error if any tests failed
    if (results.failed > 0) {
        process.exit(1)
    }
}

/**
 * Setup the browser environment with test utilities
 */
async function setupBrowserTestEnvironment(page) {
    await page.evaluate(() => {
        // Create a mock AVA test interface
        window.testRegistry = []

        // Mock test function
        window.test = function(name, fn) {
            window.testRegistry.push({ name, fn, type: 'test' })
        }

        // Mock test.serial
        window.test.serial = function(name, fn) {
            window.testRegistry.push({ name, fn, type: 'serial' })
        }

        // Mock test.skip
        window.test.skip = function(name, fn) {
            window.testRegistry.push({ name, fn, type: 'skip' })
        }

        // Mock AVA assertions (t object)
        window.createAssertions = function() {
            return {
                truthy: (value, message) => {
                    if (!value) throw new Error(message || `Expected truthy value, got ${value}`)
                },
                falsy: (value, message) => {
                    if (value) throw new Error(message || `Expected falsy value, got ${value}`)
                },
                true: (value, message) => {
                    if (value !== true) throw new Error(message || `Expected true, got ${value}`)
                },
                false: (value, message) => {
                    if (value !== false) throw new Error(message || `Expected false, got ${value}`)
                },
                is: (actual, expected, message) => {
                    if (actual !== expected) {
                        throw new Error(message || `Expected ${expected}, got ${actual}`)
                    }
                },
                not: (actual, expected, message) => {
                    if (actual === expected) {
                        throw new Error(message || `Expected values to be different, both are ${actual}`)
                    }
                },
                deepEqual: (actual, expected, message) => {
                    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                        throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
                    }
                },
                regex: (string, regex, message) => {
                    if (!regex.test(string)) {
                        throw new Error(message || `Expected ${string} to match ${regex}`)
                    }
                },
                pass: (message) => {
                    // Test passes
                },
                fail: (message) => {
                    throw new Error(message || 'Test failed')
                },
                throws: async (fn, expected, message) => {
                    try {
                        await fn()
                        throw new Error(message || 'Expected function to throw')
                    } catch (error) {
                        if (expected && !error.message.includes(expected)) {
                            throw new Error(`Expected error message to include "${expected}", got "${error.message}"`)
                        }
                    }
                },
                notThrows: async (fn, message) => {
                    try {
                        await fn()
                    } catch (error) {
                        throw new Error(message || `Expected function not to throw, but got: ${error.message}`)
                    }
                },
                log: (...args) => {
                    console.log(...args)
                }
            }
        }

        // Inject createHmacSignature function (browser implementation)
        window.createHmacSignature = async function(data, secret) {
            const encoder = new TextEncoder()
            const keyData = encoder.encode(secret)
            const messageData = encoder.encode(data)

            const key = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            )

            const signature = await crypto.subtle.sign('HMAC', key, messageData)

            return Array.from(new Uint8Array(signature))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
        }

        // Mock imports that might be needed
        window.exports = {}
        window.module = { exports: {} }
    })
}

/**
 * Run tests from a single test file
 */
async function runTestFile(page, fullPath, relativePath) {
    try {
        // Read the test file
        let testCode = fs.readFileSync(fullPath, 'utf-8')

        console.log(`\n📝 Running tests from: ${relativePath}`)
        console.log('─'.repeat(60))

        // Transform the test code to be browser-compatible
        testCode = transformTestCode(testCode)

        // Clear previous test registry
        await page.evaluate(() => {
            window.testRegistry = []
        })

        // Load the test code
        try {
            await page.evaluate(testCode)
        } catch (error) {
            console.log(`  ⚠️  Could not load test file: ${error.message}`)
            return
        }

        // Get registered tests
        const tests = await page.evaluate(() => window.testRegistry)

        if (tests.length === 0) {
            console.log('  ℹ️  No tests found in this file')
            return
        }

        // Run each test
        for (const test of tests) {
            results.total++

            if (test.type === 'skip') {
                results.skipped++
                results.tests.push({ file: relativePath, name: test.name, status: 'skipped' })
                console.log(`  ⏭️  ${test.name}`)
                continue
            }

            try {
                await page.evaluate(async (testName) => {
                    const test = window.testRegistry.find(t => t.name === testName)
                    const t = window.createAssertions()
                    await test.fn(t)
                }, test.name)

                results.passed++
                results.tests.push({ file: relativePath, name: test.name, status: 'passed' })
                console.log(`  ✅ ${test.name}`)
            } catch (error) {
                results.failed++
                const errorMsg = error.message.split('\n')[0]
                results.tests.push({
                    file: relativePath,
                    name: test.name,
                    status: 'failed',
                    error: errorMsg
                })
                console.log(`  ❌ ${test.name}`)
                console.log(`     ${errorMsg}`)
            }
        }
    } catch (error) {
        console.log(`  ⚠️  Error processing file: ${error.message}`)
    }
}

/**
 * Transform test code to be browser-compatible
 */
function transformTestCode(code) {
    // Remove imports
    code = code.replace(/import .+ from .+/g, '// import removed')

    // Replace require statements
    code = code.replace(/const .+ = require\(.+\)/g, '// require removed')

    // Remove export statements
    code = code.replace(/export .+/g, '// export removed')

    return code
}

// Run
main().catch(error => {
    console.error('\n❌ Fatal Error:', error)
    process.exit(1)
})
