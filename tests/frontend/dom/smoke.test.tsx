import { describe, expect, test } from 'bun:test'
import '../setup'
import { render, screen } from '@testing-library/react'

function Hello() {
	return (
		<div>
			<h1>Hello</h1>
			<button type="button" disabled>
				Disabled
			</button>
		</div>
	)
}

describe('frontend test environment', () => {
	test('renders and supports jest-dom matchers', () => {
		render(<Hello />)
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello')
		expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
	})
})
