import React,{lazy,Suspense,useEffect,useState}from"react";
import{BrowserRouter,Routes,Route,useParams,useLocation,Navigate}from"react-router-dom";
import HomePage from "./HomePage";
const ToursListing=lazy(()=>import("./pages/ToursListing"));
const InternationalTours=lazy(()=>import("./pages/InternationalTours"));
const AdminInternationalTours=lazy(()=>import("./pages/AdminInternationalTours"));
const TourPage=lazy(()=>import("./pages/TourPage"));
const NotFound=lazy(()=>import("./pages/NotFound"));
const AdminLogin=lazy(()=>import("./pages/AdminLogin"));
const AdminTours=lazy(()=>import("./pages/AdminTours"));
const AdminGallery=lazy(()=>import("./pages/AdminGallery"));
const AdminFAQs=lazy(()=>import("./pages/AdminFAQs"));
const AdminPlaceholder=lazy(()=>import("./pages/AdminPlaceholder"));
import{getPublishedTours,getTourBySlug}from"./lib/tourRepository";
function ScrollToTop(){const{pathname}=useLocation();useEffect(()=>{window.scrollTo({top:0,left:0,behavior:"auto"});},[pathname]);return null;}
function TourRoute(){const{slug}=useParams();const[tour,setTour]=useState(undefined);const[allTours,setAllTours]=useState([]);useEffect(()=>{let active=true;Promise.all([getTourBySlug(slug),getPublishedTours()]).then(([t,all])=>{if(active){setTour(t);setAllTours(all);}}).catch(()=>{if(active)setTour(null);});return()=>{active=false;};},[slug]);if(tour===undefined)return <div className="min-h-screen bg-slate-950 text-white grid place-items-center">Loading tour…</div>;return tour?<TourPage tour={tour} allTours={allTours}/>:<NotFound/>}
export const App=()=> <BrowserRouter><ScrollToTop/><Suspense fallback={<div className="min-h-screen bg-slate-950" aria-label="Loading page" />}><Routes><Route path="/" element={<HomePage/>}/><Route path="/tours" element={<ToursListing/>}/><Route path="/international-tours" element={<InternationalTours/>}/><Route path="/international-tours/:slug" element={<InternationalTours/>}/><Route path="/tours/:slug" element={<TourRoute/>}/><Route path="/admin" element={<Navigate to="/admin/tours" replace/>}/><Route path="/admin/login" element={<AdminLogin/>}/><Route path="/admin/tours" element={<AdminTours/>}/><Route path="/admin/international-tours" element={<AdminInternationalTours/>}/><Route path="/admin/gallery" element={<AdminGallery/>}/><Route path="/admin/faqs" element={<AdminFAQs/>}/><Route path="/admin/contact-info" element={<AdminPlaceholder/>}/><Route path="*" element={<NotFound/>}/></Routes></Suspense></BrowserRouter>;
export default App;
