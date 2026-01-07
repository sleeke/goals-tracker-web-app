# Glossary

This glossary explains technical terms used in the Goal Tracker documentation and codebase.

## A

**Asynchronous (Async)**
- Code that doesn't complete immediately
- Uses `async/await` syntax
- Example: Fetching data from database takes time
- See: [JavaScript Async/Await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)

**Authentication**
- Process of verifying a user is who they claim to be
- Usually done with email/password or social login
- See: [Authentication documentation](./03-AUTHENTICATION.md)

**API (Application Programming Interface)**
- Set of functions/methods for communicating with external systems
- Firebase API: Set of functions for communicating with Firebase
- Example: `createUserWithEmailAndPassword()` is part of Firebase Auth API

## B

**Bind (Binding)**
- Connecting a variable to a value
- Data binding: UI updates when data changes
- Two-way binding: Data ↔ UI (both directions)

**BDD (Behavior-Driven Development)**
- Testing approach using plain English descriptions
- Uses Cucumber/Gherkin syntax
- Example: "Given user is logged in, When user creates goal, Then goal appears"
- See: [Testing Guide](./10-TESTING.md)

**Bundle**
- Collection of code files combined into one or more files
- Webpack/Vite create bundles for browsers
- Smaller bundles = faster downloads

## C

**Cache**
- Storing data for quick access
- Browser cache: Stores files locally to avoid re-downloading
- Service Worker cache: Stores app assets for offline use
- See: [Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md)

**Component**
- Reusable piece of UI (button, form, card, etc.)
- React component: Function that returns JSX (HTML-like code)
- Think of as LEGO blocks for building UIs
- See: [Components Guide](./07-COMPONENTS.md)

**Context API**
- React feature for sharing data between components without passing props
- Useful for global state (user, theme, etc.)
- Avoids "prop drilling" (passing props through many components)
- See: [Authentication](./03-AUTHENTICATION.md)

## D

**DOM (Document Object Model)**
- JavaScript's view of HTML elements
- `document.getElementById()` accesses DOM
- React abstracts DOM manipulation

**Database**
- System for storing and retrieving data
- Firestore: Cloud database (in the cloud)
- IndexedDB: Browser database (on device)
- SQL database: Uses SQL language (MySQL, PostgreSQL)

**Debounce**
- Delaying action until user stops doing something
- Example: Search input waits 300ms after user stops typing before searching
- Reduces unnecessary operations

## E

**E2E (End-to-End) Testing**
- Testing complete user workflows
- Uses real browser to test real interactions
- Slow but catches real issues
- See: [Testing Guide](./10-TESTING.md)

**Environment Variables**
- Settings that change between environments (dev, production)
- In `.env.local` file
- Example: Different Firebase projects for dev vs production
- See: [Configuration](./09-CONFIGURATION.md)

**ES6 / ESNext**
- Modern JavaScript standard
- Features: arrow functions, classes, template literals, etc.
- Vite converts to older JavaScript for older browsers

## F

**Firebase**
- Google's platform for web/mobile apps
- Services: Authentication, Firestore database, Hosting
- Real-time updates built-in
- See: [Architecture Overview](./01-ARCHITECTURE.md)

**Firestore**
- Firebase's cloud database
- NoSQL database (different from SQL)
- Real-time listeners notify when data changes
- Document-oriented (stores documents like JSON)

**Framework**
- Pre-built structure for building apps
- React: Framework for building UIs
- Next.js: Framework built on React with more features
- Handles common patterns so you don't reinvent the wheel

## G

**Getter / Getter Function**
- Method that returns a value
- Usually prefixed with `get`, like `getGoals()`
- In TypeScript interfaces: `get userName(): string`

**Git**
- Version control system
- Tracks changes to code
- Allows undoing changes, branching, etc.
- See: [Git Documentation](https://git-scm.com/doc)

**Global State**
- Data accessible everywhere in app
- User authentication is global state
- In this app: Managed with AuthContext

## H

**Hook (React Hook)**
- Function that "hooks into" React features
- `useState`: Manage component state
- `useEffect`: Run code when component mounts/updates
- `useContext`: Access shared data
- Must start with `use` prefix
- See: [React Hooks](https://react.dev/reference/react)

**Hash / Hashing**
- One-way encryption
- Input → hash (cannot reverse)
- Used for passwords (never store plain text)
- Example: Password "secret123" → hash "$2b$12$R9h/cIPz0..."

**HTTP / HTTPS**
- Protocol for web communication
- HTTPS: Encrypted version (secure)
- Request/Response: Browser requests data, server responds
- Status codes: 200 (OK), 404 (Not Found), 500 (Server Error)

## I

**IndexedDB**
- Browser's local database
- Stores data on device (not cloud)
- Works offline
- Larger storage than localStorage (~50MB)
- See: [Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md)

**Interface**
- In TypeScript: Defines shape of object (properties and types)
- Contract: Components expect props matching interface
- Example: `interface GoalProps { goal: Goal; onDelete: () => void }`
- See: [Data Types](./02-DATA-TYPES.md)

**Immutable**
- Cannot be changed after creation
- `readonly` keyword in TypeScript
- Prevents accidental modifications
- Easier to reason about data flow

## J

**JavaScript**
- Language that runs in browsers
- Dynamic: Variables can be any type
- Event-driven: Responds to user actions
- See: [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**JSON (JavaScript Object Notation)**
- Format for storing/transmitting data
- Looks like JavaScript objects
- Human-readable
- Example: `{ "name": "John", "age": 30 }`

**JSX**
- Syntax for writing HTML in JavaScript
- React extension to JavaScript
- Looks like HTML but is actually JavaScript
- Example: `<GoalCard goal={goal} />`
- See: [JSX Guide](https://react.dev/learn/writing-markup-with-jsx)

## L

**Listener / Event Listener**
- Function that listens for events
- Firebase listener: Notified when data changes
- DOM listener: Notified when user clicks, types, etc.
- Example: `onSnapshot(query, callback)` - callback fires when data changes

**Localhost**
- "This computer"
- `localhost:5173` means your development server on port 5173
- Only accessible from your computer (not internet)

## M

**Middleware**
- Code that runs between request and response
- Service workers are a kind of middleware
- Can modify requests/responses

**Mutation**
- Changing data
- `mutations` in database: Creating, updating, deleting records
- Optimistic mutation: Update UI before confirmation

## N

**Node.js**
- JavaScript runtime for servers
- `npm` comes with Node.js
- Allows running JavaScript outside browsers
- See: [Node.js Guide](https://nodejs.org/docs/)

**NoSQL**
- Database without SQL language
- Document-oriented: Stores documents (like JSON)
- Firestore is NoSQL
- More flexible than SQL for some use cases

## O

**Offline-First**
- Design approach: Work offline, sync when online
- App functionality doesn't depend on internet
- Data syncs automatically when connection returns
- See: [Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md)

**Optimistic Update**
- Update UI immediately, assume server will agree
- If server rejects, rollback the UI update
- Makes app feel fast and responsive

## P

**Port**
- Number identifying a service on computer
- `localhost:5173` - port 5173
- 3000, 8000, 5173 are common for development

**Promise**
- JavaScript object representing async operation
- States: pending, fulfilled, rejected
- `async/await` is modern syntax for promises
- See: [JavaScript Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

**Props (Properties)**
- Data passed from parent component to child
- Read-only inside child component
- Component receives props as function argument
- Example: `<GoalCard goal={myGoal} />`

**PWA (Progressive Web App)**
- Web app that works like native app
- Works offline
- Can be installed on home screen
- Service Worker enables PWA features
- See: [PWA Guide](https://web.dev/progressive-web-apps/)

## Q

**Query**
- Request for data from database
- Firestore query: `collection('goals').where('userId', '==', uid)`
- Can filter, sort, limit results

**Queue**
- Data structure: First-In-First-Out
- SyncQueue: Operations waiting to sync to cloud
- Retry queue: Failed operations waiting to retry

## R

**React**
- JavaScript library for building UIs
- Component-based: Build UI from reusable pieces
- Declarative: Describe what UI should look like
- Virtual DOM: React's fast rendering system
- See: [React Guide](https://react.dev)

**Reducer**
- Function that takes current state + action, returns new state
- Used with Redux or `useReducer` hook
- Pure function: Same input always gives same output

**Render**
- Draw component on screen
- React renders when state/props change
- Browser renders HTML/CSS/JavaScript

**REST API**
- Style of API using HTTP methods
- GET: Read data
- POST: Create data
- PUT/PATCH: Update data
- DELETE: Delete data

**Revert**
- Undo an action
- In Goal Tracker: "Revert progress" marks entry as reverted
- Different from delete: Keeps audit trail

## S

**Service**
- Function/file containing business logic
- Handles: API calls, database operations, calculations
- Separate from UI logic
- See: [Services Guide](./08-SERVICES.md)

**Service Worker**
- JavaScript running in background
- Intercepts network requests
- Enables offline functionality
- Powers PWA features
- See: [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

**Setter / Setter Function**
- Method that updates a value
- Usually prefixed with `set`, like `setGoals()`
- In TypeScript: `set userName(value: string)`
- React: `setState` is a setter

**State**
- Data that changes over time
- Component state: Data specific to a component
- Global state: Data shared across all components
- When state changes, component re-renders

**Synchronization (Sync)**
- Keeping data consistent across devices/systems
- Local cache syncs with cloud database
- Real-time sync: Changes appear immediately
- See: [Offline-First & Sync](./06-OFFLINE-FIRST-SYNC.md)

## T

**Timestamp**
- Point in time, usually as number (milliseconds since 1970)
- Firestore Timestamp: Special timestamp type
- `new Date()`: JavaScript timestamp
- Used for sorting, detecting changes

**Token**
- Unique identifier proving authentication
- Session token: Proves user is logged in
- JWT: Common token format
- Expires after time period

**TypeScript**
- JavaScript with type safety
- Prevents errors by checking types
- `string`, `number`, `boolean`, custom types
- Compiles to plain JavaScript
- See: [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## U

**Unit Test**
- Test single function in isolation
- Fast, tests specific functionality
- Example: Test `calculateGoalProgress()` with mock data
- See: [Testing Guide](./10-TESTING.md)

**Unsubscribe**
- Stop listening for updates
- Firebase listeners return unsubscribe function
- Important for cleanup to avoid memory leaks

## V

**Vite**
- Build tool and development server
- Fast development experience
- Creates optimized production builds
- See: [Vite Guide](https://vitejs.dev/)

**Virtual DOM**
- React's internal representation of UI
- React compares old vs new Virtual DOM
- Only updates changed parts in real DOM
- Makes React fast

## W

**Webhook**
- URL that receives notifications
- Used for background sync
- Service Worker uses webhook pattern

**Webpack**
- Build tool (similar to Vite)
- More powerful but slower than Vite
- Many projects use Webpack

## X

**XML / XHR (XMLHttpRequest)**
- Old format for data (replaced by JSON)
- XHR: Old way to make HTTP requests
- Replaced by `fetch()` API

## Z

**Zustand**
- State management library for React
- Alternative to Redux/Context API
- Simpler API than Redux

---

## Related Resources

- [React Glossary](https://react.dev/learn/qna#glossary)
- [MDN Web Glossary](https://developer.mozilla.org/en-US/docs/Glossary)
- [JavaScript Glossary](https://javascript.info)
- [TypeScript Glossary](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
