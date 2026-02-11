import React from 'react';

const stats = [
  { label: 'Businesses Helped', value: '500+' },
  { label: 'Transactions Managed', value: '$100M+' },
  { label: 'Customer Satisfaction', value: '98%' },
  { label: 'Uptime Guarantee', value: '99.9%' },
];

const Stats: React.FC = () => {
  return (
    <section className="py-20 px-6 border-y border-white/5 bg-[#08080a]">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <span className="text-4xl md:text-5xl font-serif italic text-white">{stat.value}</span>
            <span className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;