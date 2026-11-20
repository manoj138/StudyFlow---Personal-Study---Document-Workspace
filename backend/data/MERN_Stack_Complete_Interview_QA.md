# MERN STACK – COMPLETE INTERVIEW QUESTIONS & ANSWERS
## Beginner to Advanced | Simple English Answers + Marathi Explanation

> **Answer format requested:**
>
> **Q1: What is MERN Stack?**  
> **Ans:** MERN Stack is a full-stack JavaScript technology stack used to build modern web applications. It includes MongoDB, Express.js, React.js, and Node.js.
>
> **मराठी स्पष्टीकरण:** MERN Stack वापरून frontend, backend आणि database असलेले पूर्ण web application तयार करता येते.

---

# PART 1 – MERN STACK FUNDAMENTALS

**Q1: What is MERN Stack?**  
**Ans:** MERN Stack is a full-stack JavaScript technology stack used to build modern web applications. It includes MongoDB, Express.js, React.js, and Node.js.

**मराठी स्पष्टीकरण:** MERN Stack वापरून frontend, backend आणि database असलेले पूर्ण web application तयार करता येते.

**Q2: What is the full form of MERN?**  
**Ans:** MERN stands for MongoDB, Express.js, React.js, and Node.js.

**मराठी स्पष्टीकरण:** MongoDB (Database), Express.js (Backend Framework), React.js (Frontend Library), आणि Node.js (JavaScript Runtime).

**Q3: What is MongoDB used for in MERN Stack?**  
**Ans:** MongoDB is used to store and manage application data in a document-oriented database.

**मराठी स्पष्टीकरण:** ॲप्लिकेशनचा डेटा (उदा. युझर प्रोफाईल, प्रॉडक्ट्स, पोस्ट्स) डेटाबेसमध्ये BSON/JSON फॉरमॅटमध्ये सेव्ह करण्यासाठी MongoDB वापरतात.

**Q4: What is Express.js used for?**  
**Ans:** Express.js is a backend framework used to create APIs, handle HTTP requests, manage routes, and use middleware.

**मराठी स्पष्टीकरण:** Node.js वर सर्व्हर तयार करण्यासाठी आणि Frontend ला डेटा पुरवणारे APIs बनवण्यासाठी Express.js चा वापर होतो.

**Q5: What is React.js used for?**  
**Ans:** React.js is a JavaScript library used to build interactive and reusable user interfaces.

**मराठी स्पष्टीकरण:** वेब ॲप्लिकेशनचा समोरचा भाग (Frontend/UI) जलद आणि कॉम्पोनंट्स वापरून बनवण्यासाठी React वापरतात.

**Q6: What is Node.js used for?**  
**Ans:** Node.js is a JavaScript runtime used to execute JavaScript outside the browser and build backend applications.

**मराठी स्पष्टीकरण:** जावास्क्रिप्ट कोड ब्राउझरच्या बाहेर कॉम्प्युटर/सर्व्हरवर चालवण्यासाठी Node.js चा वापर होतो.

**Q7: Why do we use MERN Stack?**  
**Ans:** We use MERN Stack because it allows developers to build complete applications using JavaScript. It supports reusable components, flexible data storage, and efficient API development.

**मराठी स्पष्टीकरण:** Frontend आणि Backend दोन्हीसाठी फक्त एकच लँग्वेज (JavaScript) लागते, त्यामुळे काम सोपे आणि वेगवान होते.

**Q8: What are the advantages of MERN Stack?**  
**Ans:** The main advantages are one programming language across frontend and backend, reusable React components, flexible MongoDB documents, a large community, and many available packages.

**मराठी स्पष्टीकरण:** १. सिंगल लँग्वेज (JS) २. रिॲक्टचे रियुझेबल कॉम्पोनंट्स ३. मॉंगोडीबीची लवचिकता ४. एनपीएम पॅकेजेसचा प्रचंड सपोर्ट.

**Q9: Explain MERN Stack architecture.**  
**Ans:** React handles the user interface. It sends HTTP requests to the Express server running on Node.js. Express processes the request and communicates with MongoDB. Finally, the server sends a response to React.

**मराठी स्पष्टीकरण:** React request पाठवतो → Express request handle करतो → MongoDB मधून data घेतो → Backend response पाठवतो → React UI update करतो.

**Q10: Explain the request-response cycle in MERN Stack.**  
**Ans:** The client sends a request to the backend. The backend validates and processes the request, interacts with the database if required, and sends a response to the client.

**मराठी स्पष्टीकरण:** युझरने बटण दाबलं की क्लायंट रिक्वेस्ट सर्व्हरकडे जाते, सर्व्हर डेटाबेसकडून माहिती घेऊन क्लायंटला रिस्पॉन्स परत पाठवतो.

**Q11: What is frontend?**  
**Ans:** Frontend is the user-facing part of an application. It displays information and handles user interactions.

**मराठी स्पष्टीकरण:** युझरला स्क्रीनवर जे काही दिसते (बटन्स, फॉर्म्स, डिझाईन) त्याला Frontend म्हणतात.

**Q12: What is backend?**  
**Ans:** Backend is the server-side part of an application. It handles business logic, authentication, database operations, and API responses.

**मराठी स्पष्टीकरण:** पडद्यामागे चालणारे सर्व काम (लॉजिक, डेटाबेसशी बोलणे, पासवर्ड व्हेरिफाय करणे) Backend मध्ये होते.

**Q13: What is an API?**  
**Ans:** API stands for Application Programming Interface. It allows two software applications to communicate with each other.

**मराठी स्पष्टीकरण:** दोन सिस्टीम्स किंवा Frontend आणि Backend यांच्यात संवाद घडवून आणणारा पूल म्हणजे API.

**Q14: What is a REST API?**  
**Ans:** REST API is an API design style that uses HTTP methods and resources to communicate between client and server.

**मराठी स्पष्टीकरण:** HTTP मेथड्स (GET, POST, PUT, DELETE) वापरून डेटाची देवाणघेवाण करणारा स्टँडर्ड आर्किटेक्चरल पॅटर्न.

**Q15: What is JSON?**  
**Ans:** JSON stands for JavaScript Object Notation. It is a lightweight data format used to exchange data between applications.

```json
{
  "name": "Manoj",
  "email": "manoj@example.com",
  "role": "developer"
}
```

**मराठी स्पष्टीकरण:** डेटा वाचायला आणि ट्रान्सफर करायला सोपा असा टेक्स्ट फॉरमॅट, जो सर्व प्रोग्रामिंग लँग्वेजेसमध्ये चालतो.

**Q16: What is the difference between SQL and NoSQL?**  
**Ans:** SQL databases store data in tables with rows and columns. NoSQL databases such as MongoDB store data in flexible document structures.

**मराठी स्पष्टीकरण:** SQL मध्ये टेबल आणि फिक्स स्कीमा असतो (उदा. MySQL). NoSQL मध्ये लवचिक JSON डॉक्युमेंट्स असतात (उदा. MongoDB).

**Q17: What is MVC architecture?**  
**Ans:** MVC stands for Model, View, and Controller. Model handles data, View displays the user interface, and Controller handles application logic.

**मराठी स्पष्टीकरण:** कोड व्यवस्थित ठेवण्यासाठी ३ भाग: Model (डेटा), View (स्क्रीन/UI), आणि Controller (लॉजिक).

**Q18: How is MVC used in MERN Stack?**  
**Ans:** In MERN, Mongoose models represent the Model, React represents the View, and Express controllers handle request logic.

**मराठी स्पष्टीकरण:** Mongoose = Model, React = View, Express Route/Controller = Controller.

**Q19: What is a route?**  
**Ans:** A route defines an endpoint and the HTTP method used to handle a client request.

**मराठी स्पष्टीकरण:** URL चा पत्ता (उदा. `/api/users`), ज्यावर रिक्वेस्ट आल्यावर काय करायचे ते ठरवले जाते.

**Q20: What is a controller?**  
**Ans:** A controller contains the logic used to process a request and send a response.

**मराठी स्पष्टीकरण:** राऊटवर रिक्वेस्ट आल्यावर प्रत्यक्षात जो कोड डेटाबेसमधून डेटा आणतो आणि रिस्पॉन्स देतो त्याला कंट्रोलर म्हणतात.

**Q21: What is middleware?**  
**Ans:** Middleware is a function that executes during the request-response cycle. It can access `req`, `res`, and `next`.

**मराठी स्पष्टीकरण:** रिक्वेस्ट कंट्रोलरपर्यंत पोहोचण्यापूर्वी मध्येच तपासणी करणारे फंक्शन (उदा. युझर लॉग-इन आहे का ते तपासणे).

**Q22: What is the difference between route and controller?**  
**Ans:** A route defines the endpoint and connects it to a handler. A controller contains the actual request-processing logic.

**मराठी स्पष्टीकरण:** Route म्हणजे पत्ता (URL Endpoint) आणि Controller म्हणजे तिथे काम करणारा अधिकारी (Logic function).

**Q23: What is environment variable?**  
**Ans:** An environment variable stores configuration values outside source code, such as database URLs, API keys, and secrets.

**मराठी स्पष्टीकरण:** महत्त्वाचे पासवर्ड्स आणि सिक्रेट्स कोडमध्ये न लिहिता `.env` फाईलमध्ये सुरक्षित ठेवणे.

**Q24: What is CORS?**  
**Ans:** CORS stands for Cross-Origin Resource Sharing. It is a browser security mechanism that controls access to resources from another origin.

**मराठी स्पष्टीकरण:** पोर्ट ३००० (React) वरून पोर्ट ५००० (Node) कडे डेटा मागताना ब्राउझर सुरक्षेसाठी अडवतो, त्याला परवानगी देणे म्हणजे CORS हँडल करणे.

**Q25: What is the difference between authentication and authorization?**  
**Ans:** Authentication verifies who the user is. Authorization checks what the authenticated user is allowed to access.

**मराठी स्पष्टीकरण:** Authentication = "तू कोण आहेस?" (Login). Authorization = "तुला काय करण्याचा अधिकार आहे?" (User की Admin).

---

# PART 2 – REACT.JS

**Q26: What is React.js?**  
**Ans:** React is a JavaScript library used to build interactive user interfaces. It uses reusable components and a declarative approach.

**मराठी स्पष्टीकरण:** युझर इंटरफेस बनवण्यासाठी फेसबुकने तयार केलेली एक सुपरफास्ट जावास्क्रिप्ट लायब्ररी.

**Q27: What is a component in React?**  
**Ans:** A component is a reusable piece of UI. We can divide a large application into smaller components.

**मराठी स्पष्टीकरण:** संपूर्ण पेजचे लहान लहान तुकडे (उदा. Header, Button, Card) जे पुन्हा पुन्हा वापरता येतात.

**Q28: What are props in React?**  
**Ans:** Props are used to pass data from a parent component to a child component. Props are read-only.

**मराठी स्पष्टीकरण:** एका कॉम्पोनंटकडून दुसऱ्या कॉम्पोनंटला पाठवला जाणारा डेटा, जो फक्त वाचता येतो (बदलता येत नाही).

**Q29: What is state in React?**  
**Ans:** State stores data inside a component. When state changes, React can re-render the component to display updated information.

**मराठी स्पष्टीकरण:** कॉम्पोनंटचा स्वतःचा डेटा, जो बदलला की स्क्रीन आपोआप नवीन व्हॅल्यूने री-रेंडर होते.

**Q30: What is useState?**  
**Ans:** `useState` is a React Hook used to add and update state in functional components.

**मराठी स्पष्टीकरण:** फंक्शनल कॉम्पोनंटमध्ये स्टेट तयार करण्यासाठी आणि ती अपडेट करण्यासाठी लागणारा मूळ हुक.

**Q31: What is useEffect?**  
**Ans:** `useEffect` is a React Hook used to synchronize a component with external systems, such as APIs, subscriptions, or timers.

**मराठी स्पष्टीकरण:** डेटा फेच करणे (API Calls), टाइमर लावणे किंवा DOM बदलणे अशा साईड-इफेक्ट्ससाठी वापरला जाणारा हुक.

**Q32: What is the dependency array in useEffect?**  
**Ans:** The dependency array controls when an effect runs again. An empty array means the effect has no reactive dependencies; a list of dependencies makes it re-run when those values change.

**मराठी स्पष्टीकरण:** `[]` रिकामी असेल तर इफेक्ट फक्त एकदाच (माऊंट झाल्यावर) चालतो. `[id]` दिल्यास `id` बदलल्यावरच पुन्हा चालतो.

**Q33: What happens if we do not provide a dependency array in useEffect?**  
**Ans:** The effect runs after every committed render of the component.

**मराठी स्पष्टीकरण:** कॉम्पोनंट जेवढ्या वेळा री-रेंडर होईल, तेवढ्या वेळा तो कोड सतत चालू राहतो (Infinite loop चा धोका).

**Q34: What is useRef?**  
**Ans:** `useRef` stores a mutable value that does not cause a re-render when changed. It can also be used to access DOM elements.

**मराठी स्पष्टीकरण:** री-रेंडर न करता व्हॅल्यू साठवण्यासाठी किंवा एखाद्या HTML इनपुटला थेट फोकस करण्यासाठी वापरतात.

**Q35: What is useMemo?**  
**Ans:** `useMemo` caches the result of a calculation between renders when its dependencies have not changed.

**मराठी स्पष्टीकरण:** कठीण आणि मोठी आकडेमोड कॅश (Cache) करून ठेवण्यासाठी वापरतात जेणेकरून परफॉर्मन्स वाढतो.

**Q36: What is useCallback?**  
**Ans:** `useCallback` caches a function definition between renders when its dependencies have not changed.

**मराठी स्पष्टीकरण:** चाइल्ड कॉम्पोनंटला पाठवले जाणारे फंक्शन प्रत्येक रेंडरला नव्याने तयार होऊ नये म्हणून त्याला कॅश करणे.

**Q37: What is the difference between useMemo and useCallback?**  
**Ans:** `useMemo` caches a calculation result, while `useCallback` caches a function reference.

**मराठी स्पष्टीकरण:** `useMemo` रिझल्ट (व्हॅल्यू) सेव्ह करतो, `useCallback` पूर्ण फंक्शन डेफिनेशन सेव्ह करतो.

**Q38: What is Virtual DOM?**  
**Ans:** Virtual DOM is a lightweight JavaScript representation of the real DOM. React uses it to calculate and apply necessary UI updates.

**मराठी स्पष्टीकरण:** खऱ्या DOM ची जावास्क्रिप्टमधील एक डमी कॉपी. आधी यात बदल होतात, मग फरक (Diff) काढून फक्त तेवढाच भाग खऱ्या स्क्रीनवर बदलला जातो.

**Q39: What is reconciliation in React?**  
**Ans:** Reconciliation is the process React uses to compare the previous and new UI trees and determine the required updates.

**मराठी स्पष्टीकरण:** जुना व्हर्च्युअल डॉम आणि नवीन व्हर्च्युअल डॉम यांची तुलना करून किमान बदल शोधण्याची रिॲक्टची अंतर्गत प्रक्रिया.

**Q40: What is React Context API?**  
**Ans:** Context API allows components to share data without passing props through every intermediate component.

**मराठी स्पष्टीकरण:** मधल्या कॉम्पोनंट्सना त्रास न देता थेट कोणत्याही खोलवरच्या कॉम्पोनंटला ग्लोबल डेटा (उदा. User, Theme) पुरवणे.

**Q41: What is prop drilling?**  
**Ans:** Prop drilling means passing data through multiple intermediate components to reach a deeply nested child component.

**मराठी स्पष्टीकरण:** डेटा ३ऱ्या किंवा ४थ्या लेव्हलला पाठवण्यासाठी मधल्या नको असलेल्या कॉम्पोनंट्समधून डेटा पास करत जाणे.

**Q42: How can we avoid prop drilling?**  
**Ans:** We can use Context API, Redux Toolkit, or another suitable state-management solution.

**मराठी स्पष्टीकरण:** Context API किंवा Redux Toolkit वापरून डेटा ग्लोबल करून थेट हव्या त्या कॉम्पोनंटमध्ये वापरणे.

**Q43: What is React Router?**  
**Ans:** React Router is a library used for client-side navigation between pages in a React application.

**मराठी स्पष्टीकरण:** पेज रीलोड न होता एका पाथवरून दुसऱ्या पाथवर (उदा. `/dashboard` वरून `/login`) जाण्यासाठी वापरतात.

**Q44: What is a controlled component?**  
**Ans:** A controlled component is a form element whose value is managed by React state.

**मराठी स्पष्टीकरण:** ज्या इनपुट बॉक्सची व्हॅल्यू रिॲक्ट स्टेटद्वारे (`value={state}`) नियंत्रित केली जाते.

**Q45: What is an uncontrolled component?**  
**Ans:** An uncontrolled component manages its value through the DOM. We can access it using a ref.

**मराठी स्पष्टीकरण:** ज्या इनपुटची व्हॅल्यू DOM स्वतः सांभाळतो आणि आपण ती `useRef()` वापरून हवी तेव्हा वाचतो.

**Q46: What is conditional rendering?**  
**Ans:** Conditional rendering means displaying UI elements based on a condition.

**मराठी स्पष्टीकरण:** कंडिशन खरी असेल तरच स्क्रीनवर दाखवणे (उदा. `isLoggedIn ? <Home /> : <Login />`).

**Q47: Why are keys important in React?**  
**Ans:** Keys help React identify list items when they are added, removed, or changed. Stable unique IDs are preferred.

**मराठी स्पष्टीकरण:** लूपमध्ये कोणता आयटम बदलला किंवा डिलीट झाला हे रिॲक्टला पटकन ओळखण्यासाठी युनिक `key` आवश्यक असते.

**Q48: What is lazy loading in React?**  
**Ans:** Lazy loading means loading a component only when it is needed. It can reduce the initial bundle size.

**मराठी स्पष्टीकरण:** संपूर्ण कोड एकदम डाऊनलोड न करता युझर ज्या पेजवर जाईल तेव्हाच तो कॉम्पोनंट डाऊनलोड करणे.

**Q49: What is Suspense?**  
**Ans:** Suspense allows React to display fallback UI while certain child components or supported resources are waiting.

**मराठी स्पष्टीकरण:** कॉम्पोनंट किंवा डेटा लोड होत असताना लोडिंग स्पिनर (`<Loading />`) दाखवण्यासाठी वापरतात.

**Q50: What is lifting state up?**  
**Ans:** Lifting state up means moving shared state to the nearest common parent so multiple child components can use it.

**मराठी स्पष्टीकरण:** दोन भावंडांना (Sibling Components) एकच डेटा हवा असेल तर तो डेटा त्यांच्या वडिलांकडे (Parent Component) हलवणे.

**Q51: What is Redux Toolkit?**  
**Ans:** Redux Toolkit is the recommended way to write Redux logic. It simplifies global state management using slices, reducers, and actions.

**मराठी स्पष्टीकरण:** रिडक्स वापरणे खूप सोपे करणारी आधुनिक लायब्ररी, ज्यामध्ये खूप कमी बॉयलरप्लेट कोड लागतो.

**Q52: What is a Redux store?**  
**Ans:** The Redux store holds the application's global state and provides methods to access and update it through dispatched actions.

**मराठी स्पष्टीकरण:** संपूर्ण ॲप्लिकेशनचा मुख्य डेटा साठा (Central Bank of Data).

**Q53: What is a Redux slice?**  
**Ans:** A slice contains a section of Redux state, its reducers, and the generated actions.

**मराठी स्पष्टीकरण:** ग्लोबल स्टेटचा एका विषयापुरता तुकडा (उदा. `authSlice`, `cartSlice`).

**Q54: What is dispatch in Redux?**  
**Ans:** Dispatch sends an action to the Redux store so that the corresponding reducer can update the state.

**मराठी स्पष्टीकरण:** "डेटा बदलण्याची ऑर्डर पाठवणे" म्हणजे डिस्पॅच (`dispatch(login(user))`).

**Q55: What is a selector in Redux?**  
**Ans:** A selector is a function used to read specific data from the Redux store.

**मराठी स्पष्टीकरण:** स्टोअरमधून आपल्याला हवा तेवढाच डेटा वाचण्यासाठी वापरले जाणारे हुक (`useSelector`).

**Q56: Why can we use push() inside Redux Toolkit reducers?**  
**Ans:** Redux Toolkit uses Immer, which allows mutation-like code while producing immutable state updates.

**मराठी स्पष्टीकरण:** RTK मध्ये मागे **Immer** लायब्ररी काम करते, जी म्यूटेशनसारख्या कोडमधूनही सुरक्षितपणे नवीन इम्युटेबल स्टेट बनवते.

**Q57: What is the difference between local state and global state?**  
**Ans:** Local state belongs to a component or a small part of the UI. Global state is shared across multiple components or application sections.

**मराठी स्पष्टीकरण:** Local = एकाच कॉम्पोनंटपुरती (उदा. Dropdown open/close). Global = संपूर्ण ॲपसाठी (उदा. User login data).

**Q58: What is React Fragment?**  
**Ans:** A Fragment groups multiple elements without adding an extra DOM element.

**मराठी स्पष्टीकरण:** एक्स्ट्रा `<div>` न टाकता मल्टिपल टॅग्ज रेंडर करण्यासाठी `<> ... </>` वापरणे.

**Q59: What is React StrictMode?**  
**Ans:** StrictMode is a development tool that helps detect potential problems in React applications. It may run certain lifecycle or effect checks more than once in development.

**मराठी स्पष्टीकरण:** डेव्हलपमेंटमध्ये बग्स शोधण्यासाठी रिॲक्टचा तपासणी मोड (ज्यात इफेक्ट्स दोनदा रन होतात).

**Q60: What is the difference between == and === in JavaScript?**  
**Ans:** `==` compares values after type coercion, while `===` compares values and types without type coercion.

**मराठी स्पष्टीकरण:** `==` फक्त व्हॅल्यू बघतो (उदा. `'5' == 5` True). `===` व्हॅल्यू आणि डेटा टाईप दोन्ही कडकपणे तपासतो (False).

---

# PART 3 – NODE.JS

**Q61: What is Node.js?**  
**Ans:** Node.js is an open-source JavaScript runtime environment that allows JavaScript to run outside the browser.

**मराठी स्पष्टीकरण:** क्रोमच्या V8 इंजिनवर चालणारा जावास्क्रिप्ट रनटाईम, ज्यामुळे जावास्क्रिप्ट सर्व्हरवर बॅकएंड म्हणून चालते.

**Q62: Is Node.js a programming language?**  
**Ans:** No. Node.js is a runtime environment. JavaScript is the programming language.

**मराठी स्पष्टीकरण:** नाही! Node.js ही भाषा नाही, ते जावास्क्रिप्ट चालवणारे इंजिन/रनटाईम आहे.

**Q63: What is V8 engine?**  
**Ans:** V8 is the JavaScript engine developed by Google. Node.js uses V8 to execute JavaScript code.

**मराठी स्पष्टीकरण:** गुगल क्रोममधील अतिशय वेगवान जावास्क्रिप्ट एक्झिक्युशन इंजिन, जे C++ मध्ये लिहिलेले आहे.

**Q64: What is the Event Loop in Node.js?**  
**Ans:** The Event Loop coordinates asynchronous operations and allows Node.js to handle non-blocking work while JavaScript executes on its main thread.

**मराठी स्पष्टीकरण:** सिंगल थ्रेड असूनही हजारो कामे एकाच वेळी कशी हाताळायची हे ठरवणारे Node.js चे हृदय (Heart).

**Q65: Is Node.js single-threaded?**  
**Ans:** JavaScript execution in a typical Node.js event loop runs on a main thread, but Node.js also uses other threads and system-level mechanisms for certain operations.

**मराठी स्पष्टीकरण:** जावास्क्रिप्ट कोड सिंगल थ्रेडवर चालतो, पण बॅकग्राऊंडमध्ये फाईल्स किंवा नेटवर्कसाठी libuv चा थ्रेड पूल वापरला जातो.

**Q66: What is blocking I/O?**  
**Ans:** Blocking I/O prevents the JavaScript execution thread from continuing until the operation completes.

**मराठी स्पष्टीकरण:** जोपर्यंत फाईल वाचून होत नाही तोपर्यंत पुढचा कोड थांबवून ठेवणे (Blocking).

**Q67: What is non-blocking I/O?**  
**Ans:** Non-blocking I/O allows an operation to start without waiting for it to finish before handling other work.

**मराठी स्पष्टीकरण:** काम सुरू करून देणे आणि पूर्ण होईपर्यंत न थांबता लगेच पुढच्या युझरचे काम हातात घेणे.

**Q68: What is npm?**  
**Ans:** npm stands for Node Package Manager. It is used to install, manage, and share JavaScript packages.

**मराठी स्पष्टीकरण:** जगभरातील डेव्हलपर्सनी बनवलेल्या तयार लायब्ररी आणि टूल्स डाऊनलोड करण्याचे स्टोअर.

**Q69: What is package.json?**  
**Ans:** `package.json` contains project information, dependencies, scripts, and configuration.

**मराठी स्पष्टीकरण:** प्रोजेक्टचे ओळखपत्र, ज्यात प्रोजेक्टचे नाव, व्हर्जन आणि कोणत्या लायब्ररी वापरल्या आहेत त्याची यादी असते.

**Q70: What is package-lock.json?**  
**Ans:** `package-lock.json` records the exact dependency tree and versions to support reproducible installations.

**मराठी स्पष्टीकरण:** कोणत्याही कॉम्प्युटरवर लायब्ररीची अगदी तीच अचूक सब-व्हर्जन्स इन्स्टॉल व्हावीत म्हणून बनलेली लॉक फाईल.

**Q71: What is the difference between dependencies and devDependencies?**  
**Ans:** Dependencies are packages required by the application at runtime. DevDependencies are packages mainly required during development, testing, or building.

**मराठी स्पष्टीकरण:** Dependencies (उदा. express, mongoose) ॲप चालण्यासाठी लागतात. DevDependencies (उदा. nodemon, eslint) फक्त कोडिंग करताना लागतात.

**Q72: What is nodemon?**  
**Ans:** Nodemon is a development tool that automatically restarts the Node.js server when files change.

**मराठी स्पष्टीकरण:** फाईल सेव्ह केल्यावर सर्व्हर स्वतःहून रीस्टार्ट करणारा टूल.

**Q73: What are CommonJS modules?**  
**Ans:** CommonJS is a module system used in Node.js that commonly uses `require()` and `module.exports`.

**मराठी स्पष्टीकरण:** Node.js मधील जुनी आणि पारंपरिक पद्धत (`const express = require('express')`).

**Q74: What are ES Modules?**  
**Ans:** ES Modules are the standard JavaScript module system that uses `import` and `export`.

**मराठी स्पष्टीकरण:** आधुनिक आणि स्टँडर्ड पद्धत (`import express from 'express'`).

**Q75: What is the difference between require and import?**  
**Ans:** `require()` is commonly used in CommonJS. `import` is used in ES Modules and supports static module syntax.

**मराठी स्पष्टीकरण:** `require` रनटाईमला लोड होते, `import` कंपाइलटाईम/स्टॅटिकली पार्स होते आणि अधिक आधुनिक आहे.

**Q76: What is process.env?**  
**Ans:** `process.env` provides access to environment variables available to the Node.js process.

**मराठी स्पष्टीकरण:** `.env` फाईलमधील सिक्रेट्स (उदा. `PORT`, `MONGO_URI`) ॲक्सेस करणारा ग्लोबल ऑब्जेक्ट.

**Q77: What is EventEmitter?**  
**Ans:** EventEmitter is a Node.js class used to create, emit, and listen for custom events.

**मराठी स्पष्टीकरण:** विशिष्ट घटना घडल्यावर (उदा. युझरने ऑर्डर दिली) इतर फंक्शन्सना सूचना देण्याची इव्हेंट-ड्रिव्हन पद्धत.

**Q78: What are streams in Node.js?**  
**Ans:** Streams allow data to be processed in chunks instead of loading the entire data into memory.

**मराठी स्पष्टीकरण:** मोठा डेटा (उदा. २GB चा व्हिडिओ किंवा फाईल) तुकड्या-तुकड्यात वाचणे किंवा पाठवणे.

**Q79: What is a Buffer?**  
**Ans:** Buffer is a Node.js data structure used to handle binary data.

**मराठी स्पष्टीकरण:** रॅममध्ये (Memory) तात्पुरता बाईनरी (0 आणि 1) स्वरूपात डेटा ठेवण्याची जागा.

**Q80: What are Worker Threads?**  
**Ans:** Worker Threads allow CPU-intensive JavaScript tasks to run in separate threads, helping avoid blocking the main event loop.

**मराठी स्पष्टीकरण:** खूप जड गणिते किंवा डेटा प्रोसेसिंगसाठी वेगळे थ्रेड्स चालवणे जेणेकरून मुख्य सर्व्हर अडकणार नाही.

---

# PART 4 – EXPRESS.JS

**Q81: What is Express.js?**  
**Ans:** Express.js is a lightweight web framework for Node.js. It simplifies routing, middleware, request handling, and API development.

**मराठी स्पष्टीकरण:** Node.js वर जलद आणि स्वच्छ REST APIs बनवण्यासाठी सर्वात लोकप्रिय फ्रेमवर्क.

**Q82: How do you create an Express server?**  
**Ans:**
```js
const express = require("express");
const app = express();
app.use(express.json());
app.get("/", (req, res) => res.send("Hello World"));
app.listen(5000, () => console.log("Server running"));
```

**मराठी स्पष्टीकरण:** `express()` कॉल करून ॲप बनवणे, मिडलवेअर लावणे आणि ५००० पोर्टवर सर्व्हर लिसन करणे.

**Q83: What is express.json()?**  
**Ans:** `express.json()` is built-in middleware that parses incoming JSON request bodies and makes the data available in `req.body`.

**मराठी स्पष्टीकरण:** क्लायंटने पाठवलेला JSON डेटा वाचून तो `req.body` मध्ये उपलब्ध करून देणारे इनबिल्ट मिडलवेअर.

**Q84: What is express.Router()?**  
**Ans:** `express.Router()` creates a modular router that helps organize routes into separate files.

**मराठी स्पष्टीकरण:** राऊट्स वेगवेगळ्या फाईल्समध्ये (उदा. `userRoutes.js`, `productRoutes.js`) स्वच्छ ठेवण्यासाठी मिनी-ॲप बनवणे.

**Q85: What is next() in Express?**  
**Ans:** `next()` passes control to the next middleware or route handler in the request-response cycle.

**मराठी स्पष्टीकरण:** मिडलवेअरचे काम संपल्यावर पुढच्या फंक्शनकडे रिक्वेस्ट पुढे ढकलणे.

**Q86: What is the difference between app.use() and app.get()?**  
**Ans:** `app.use()` is commonly used to register middleware for matching paths and methods broadly. `app.get()` registers a route handler specifically for GET requests.

**मराठी स्पष्टीकरण:** `use()` सर्व प्रकारच्या (GET, POST इ.) रिक्वेस्ट्सना मिडलवेअर लावतो; `get()` फक्त डेटा आणणाऱ्या GET रिक्वेस्ट्स हँडल करतो.

**Q87: What are req and res?**  
**Ans:** `req` represents the incoming request and contains request information. `res` represents the response and provides methods to send data to the client.

**मराठी स्पष्टीकरण:** `req` = युझरने काय मागितले (Request), `res` = सर्व्हरने काय उत्तर दिले (Response).

**Q88: What is req.params?**  
**Ans:** `req.params` contains dynamic values from route parameters, e.g. `/users/:id`.

**मराठी स्पष्टीकरण:** URL मधील व्हेरिएबल भाग (उदा. `/users/123` मधून `req.params.id` = `123`).

**Q89: What is req.query?**  
**Ans:** `req.query` contains query-string values from the URL, commonly used for search, filtering, and pagination.

**मराठी स्पष्टीकरण:** URL मधील `?` नंतरचा भाग (उदा. `?page=2&search=shoes`).

**Q90: What is req.body?**  
**Ans:** `req.body` contains data submitted by the client in the request body, after the appropriate body-parsing middleware runs.

**मराठी स्पष्टीकरण:** फॉर्म किंवा POST रिक्वेस्टमध्ये पाठवलेला मुख्य डेटा (उदा. नाव, ईमेल, पासवर्ड).

---

# PART 5 – MONGODB AND MONGOOSE

**Q101: What is MongoDB?**  
**Ans:** MongoDB is a NoSQL document-oriented database that stores data in BSON documents.

**मराठी स्पष्टीकरण:** टेबलऐवजी लवचिक JSON-सारख्या डॉक्युमेंट्समध्ये डेटा साठवणारा आधुनिक डेटाबेस.

**Q102: What is a collection?**  
**Ans:** A collection is a group of MongoDB documents. It is similar to a table in a relational database.

**मराठी स्पष्टीकरण:** SQL मधील Table = MongoDB मधील Collection (उदा. `users` कलेक्शन).

**Q103: What is a document?**  
**Ans:** A document is an individual record stored in a MongoDB collection.

**मराठी स्पष्टीकरण:** SQL मधील Row = MongoDB मधील Document (एका युझरचा डेटा).

**Q104: What is BSON?**  
**Ans:** BSON stands for Binary JSON. It is the binary-encoded document format used by MongoDB and supports additional data types.

**मराठी स्पष्टीकरण:** JSON ची बाईनरी आवृत्ती, ज्यामध्ये तारीख (Date), बाईनरी डेटा इत्यादी प्रकार साठवता येतात.

**Q105: What is Mongoose?**  
**Ans:** Mongoose is an ODM library for MongoDB and Node.js. It provides schemas, models, validation, middleware, and query helpers.

**मराठी स्पष्टीकरण:** Node.js मधून मॉंगोडीबीवर सहज काम करण्यासाठी, व्हॅलिडेशन लावण्यासाठी वापरली जाणारी लायब्ररी.

**Q106: What is a Schema?**  
**Ans:** A schema defines the structure, data types, and rules of documents in a Mongoose model.

**मराठी स्पष्टीकरण:** डेटाबेसमध्ये डेटा कसा असावा याचा नियम/साचा (Blueprint).

**Q107: What is a Model?**  
**Ans:** A model is an interface created from a schema that allows us to perform database operations like CRUD.

**मराठी स्पष्टीकरण:** स्कीमावरून बनवलेला क्लास, ज्याचा वापर करून आपण `User.find()` किंवा `User.create()` करतो.

**Q108: What is ObjectId?**  
**Ans:** ObjectId is a BSON data type commonly used as the unique 12-byte identifier of a MongoDB document (`_id`).

**मराठी स्पष्टीकरण:** प्रत्येक डॉक्युमेंटला मॉंगोडीबीकडून मिळणारा युनिक १२-बाईटचा प्रायमरी की आयडी (`_id`).

**Q109: What is CRUD?**  
**Ans:** CRUD stands for Create, Read, Update, and Delete. These are the four basic database operations.

**मराठी स्पष्टीकरण:** डेटा तयार करणे (Create), वाचणे (Read), बदलणे (Update), आणि काढून टाकणे (Delete).

**Q110: What is the difference between find() and findOne()?**  
**Ans:** `find()` returns an array of matching documents. `findOne()` returns the first matching document or null.

**मराठी स्पष्टीकरण:** `find()` मॅच होणारे सर्व रेकॉर्ड्स Array मध्ये देतो. `findOne()` फक्त पहिला एकच रेकॉर्ड देतो.

**Q114: What is indexing in MongoDB?**  
**Ans:** Indexing improves query performance by allowing MongoDB to locate documents more efficiently without scanning the entire collection.

**मराठी स्पष्टीकरण:** पुस्तकातील इंडेक्ससारखे, ज्यामुळे संपूर्ण डेटाबेस न शोधता एका सेकंदात डेटा शोधता येतो.

**Q116: What is aggregation in MongoDB?**  
**Ans:** Aggregation processes documents through stages ($match, $group, $sort, $lookup) to filter, group, calculate, and transform data.

**मराठी स्पष्टीकरण:** डेटा फिल्टर करणे, ग्रुप करणे, सरासरी काढणे अशा मोठ्या आकडेमोडीसाठी वापरली जाणारी पाईपलाईन.

---

# PART 6 – AUTHENTICATION & JWT

**Q126: What is authentication?**  
**Ans:** Authentication is the process of verifying a user's identity (Who are you?).

**मराठी स्पष्टीकरण:** युझर खरा आहे की खोटा हे तपासणे (ईमेल आणि पासवर्ड व्हेरिफाय करणे).

**Q127: What is authorization?**  
**Ans:** Authorization determines what an authenticated user is allowed to access or perform (What can you do?).

**मराठी स्पष्टीकरण:** युझरला कोणती पाने उघडण्याचा अधिकार आहे हे ठरवणे (उदा. Admin की Regular User).

**Q128: What is JWT?**  
**Ans:** JWT stands for JSON Web Token. It is a compact, URL-safe token format used to transmit claims securely between client and server.

**मराठी स्पष्टीकरण:** लॉगिन झाल्यावर युझरला दिला जाणारा डिजिटल पास (Token), जो प्रत्येक रिक्वेस्टसोबत पाठवला जातो.

**Q129: What are the three parts of JWT?**  
**Ans:** JWT contains Header (algorithm), Payload (user data), and Signature (secret verification).

**मराठी स्पष्टीकरण:** १. Header २. Payload ३. Signature. (उदा. `aaaa.bbbb.cccc`).

**Q131: What is bcrypt?**  
**Ans:** bcrypt is a password hashing library that uses salting and slow hashing to securely store passwords.

**मराठी स्पष्टीकरण:** पासवर्ड सुरक्षित ठेवण्यासाठी त्याला न वाचता येणाऱ्या कोडमध्ये (Hash) रूपांतरित करणारी लायब्ररी.

---

# PART 17 – MERN STACK MOCK INTERVIEW & HR (MANOJ'S PROFILE)

**Q241: Tell me about yourself.**  
**Ans:** Good morning. My name is Manoj Mansing Chougule, and I have completed my B.Tech degree in Computer Science. I have 11 months of hands-on experience working as a Junior Software Developer on MERN Stack technologies. During this period, I developed interactive React frontend interfaces, built RESTful APIs using Node.js and Express, designed MongoDB database schemas, and integrated JWT authentication. I am passionate about writing clean, scalable JavaScript code and eager to contribute to production web applications.

**मराठी स्पष्टीकरण:** आत्मविश्वासाने सांगा: "माझे नाव मनोज आहे, B.Tech CSE झाले असून मला MERN Stack वर ११ महिन्यांचा प्रत्यक्ष कामाचा अनुभव आहे. मी Frontend, APIs आणि Database तिन्हीवर काम केले आहे."

**Q242: Why do you want to become a MERN Stack Developer?**  
**Ans:** I enjoy building complete web applications from end to end. MERN Stack allows me to build modern responsive user interfaces with React and powerful, scalable backend services with Node and Express using a single unified language, JavaScript.

**मराठी स्पष्टीकरण:** "मला सुरुवातीपासून शेवटपर्यंत पूर्ण वेब ॲप बनवायला आवडते. जावास्क्रिप्ट ही एकच भाषा संपूर्ण स्टॅकमध्ये वापरता येते, म्हणून मी MERN डेव्हलपर म्हणून काम करतो."

**Q243: What was your role in your 11-month internship as Junior Software Developer?**  
**Ans:** In my internship, I worked on frontend component development in React, created and tested RESTful endpoints using Express, connected and queried MongoDB collections, fixed bugs, and collaborated using Git for version control.

**मराठी स्पष्टीकरण:** "मी रिॲक्ट कॉम्पोनंट्स बनवले, बॅकएंडचे APIs लिहिले, मॉंगोडीबी डेटाबेस क्वेरी केल्या आणि गिट वापरून टीमसोबत काम केले."
