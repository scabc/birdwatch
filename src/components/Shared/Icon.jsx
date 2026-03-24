import React from 'react';
import {
    X, Heart, Target, Feather, Leaf, Globe, MapPin, ArrowRight, ArrowLeft,
    Users, Mail, User, MessageSquare, BarChart3, PieChart, Activity,
    TrendingDown, TrendingUp, AlertTriangle, Info, Fish, Bird, BookOpen,
    Compass, Radar, Zap, Shield, Volume2, Play, Pause, Music,
    CheckCircle, XCircle, Clock, Award, LayoutGrid, Home, MousePointer2,
    ChevronDown, Sun, Star, FileText, Flag, Search, Quote, Ruler, Utensils, Eye
} from 'lucide-react';

const Icon = ({ name, size = 20, className, style }) => {
    const icons = {
        X, Heart, Target, Feather, Leaf, Globe, MapPin, ArrowRight, ArrowLeft,
        Users, Mail, User, MessageSquare, BarChart3, PieChart, Activity,
        TrendingDown, TrendingUp, AlertTriangle, Info, Fish, Bird, BookOpen,
        Compass, Radar, Zap, Shield, Volume2, Play, Pause, Music,
        CheckCircle, XCircle, Clock, Award, LayoutGrid, Home, MousePointer2,
        ChevronDown, Sun, Star, FileText, Flag, Search, Quote, Ruler, Utensils, Eye
    };
    const LucideIcon = icons[name];
    if (!LucideIcon) return null;
    return <LucideIcon size={size} className={className} style={style} />;
};

export default Icon;
