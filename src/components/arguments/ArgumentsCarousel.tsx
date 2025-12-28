'use client'

import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Swiper as SwiperInstance } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ArgumentCard from "@/components/Dashboard/ArgumentCard";
import { Argument } from "@/types/argument";

type ArgumentsCarouselProps = {
    argumentsList: Argument[];
    onVote: (argumentId: string, value: number) => void;
    onEdit?: (argumentId: string) => void;
    onDelete?: (argumentId: string) => void;
    onStatusChange?: (argumentId: string, status: "APPROVED" | "REJECTED") => void;
};

const ArgumentsCarousel = ({
    argumentsList,
    onVote,
    onEdit,
    onDelete,
    onStatusChange,
}: ArgumentsCarouselProps) => {
    const prevButtonRef = useRef<HTMLButtonElement>(null);
    const nextButtonRef = useRef<HTMLButtonElement>(null);
    const swiperRef = useRef<SwiperInstance>();

    useEffect(() => {
        if (!swiperRef.current || !prevButtonRef.current || !nextButtonRef.current) return;
        if (typeof swiperRef.current.params.navigation === "boolean") return;

        swiperRef.current.params.navigation.prevEl = prevButtonRef.current;
        swiperRef.current.params.navigation.nextEl = nextButtonRef.current;

        swiperRef.current.navigation.destroy();
        swiperRef.current.navigation.init();
        swiperRef.current.navigation.update();
    }, [argumentsList.length]);

    return (
        <div className="relative">
            <Swiper
                modules={[Navigation, Pagination, Keyboard]}
                spaceBetween={20}
                slidesPerView={1}
                pagination={{ clickable: true }}
                keyboard={{ enabled: true }}
                navigation={{ enabled: true }}
                onBeforeInit={(swiper) => {
                    swiperRef.current = swiper;
                }}
                breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
            >
                {argumentsList.map((argument) => (
                    <SwiperSlide key={argument.id} className="pb-10">
                        <div className="h-full">
                            <ArgumentCard
                                argument={argument}
                                onVote={onVote}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onStatusChange={onStatusChange}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-2">
                <button
                    ref={prevButtonRef}
                    className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 shadow-lg transition hover:-translate-x-0.5 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    aria-label="Précédent"
                >
                    <ArrowLeft size={18} />
                </button>
                <button
                    ref={nextButtonRef}
                    className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 shadow-lg transition hover:translate-x-0.5 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                    aria-label="Suivant"
                >
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default ArgumentsCarousel;
