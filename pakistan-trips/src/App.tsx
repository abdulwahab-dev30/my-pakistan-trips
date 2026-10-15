import React,{useEffect,useState}from"react";
import{BrowserRouter,Routes,Route,useParams,useLocation,Navigate}from"react-router-dom";
import HomePage from "./HomePage";
import ToursListing from "./pages/ToursListing";
import TourPage from "./pages/TourPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminTours from "./pages/AdminTours";
import AdminPlaceholder from "./pages/AdminPlaceholder";
import{getPublishedTours,getTourBySlug}from"./lib/tourRepository";
function ScrollToTop(){const{pathname}=useLocation();useEffect(()=>{window.scrollTo({top:0,left:0,behavior:"auto"});},[pathname]);return null;}
function TourRoute(){const{slug}=useParams();const[tour,setTour]=useState(undefined);const[allTours,setAllTours]=useState([]);useEffect(()=>{let active=true;Promise.all([getTourBySlug(slug),getPublishedTours()]).then(([t,all])=>{if(active){setTour(t);setAllTours(all);}}).catch(()=>{if(active)setTour(null);});return()=>{active=false;};},[slug]);if(tour===undefined)return <div className="min-h-screen bg-slate-950 text-white grid place-items-center">Loading tour…</div>;return tour?<TourPage tour={tour} allTours={allTours}/>:<NotFound/>}
export const App=()=> <BrowserRouter><ScrollToTop/><Routes><Route path="/" element={<HomePage/>}/><Route path="/tours" element={<ToursListing/>}/><Route path="/tours/:slug" element={<TourRoute/>}/><Route path="/admin" element={<Navigate to="/admin/tours" replace/>}/><Route path="/admin/login" element={<AdminLogin/>}/><Route path="/admin/tours" element={<AdminTours/>}/><Route path="/admin/gallery" element={<AdminPlaceholder/>}/><Route path="/admin/contact-info" element={<AdminPlaceholder/>}/><Route path="*" element={<NotFound/>}/></Routes></BrowserRouter>;
export default App;
